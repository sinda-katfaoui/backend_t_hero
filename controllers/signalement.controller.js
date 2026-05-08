const Signalement  = require('../models/signalement.model');
const Notification = require('../models/notification.model');
const AnalyseIA    = require('../models/analyseAI.model');
const { analyzeImage }  = require('../services/visionService');
const { analyzeReport } = require('../services/aiEngine');

const CATEGORY_MAP = {
  road:           'VOIRIE',
  waste:          'PROPRETE',
  lighting:       'ECLAIRAGE',
  danger:         'VOIRIE',
  infrastructure: 'ESPACES_VERTS',
  other:          'AUTRE',
};

const PRIORITY_MAP = {
  critical: 'ELEVEE',
  high:     'ELEVEE',
  medium:   'MOYENNE',
  low:      'FAIBLE',
};

exports.createSignalement = async (req, res) => {
  try {
    const { description, localisation, categorie, citoyen, priorite } = req.body;

    let finalCategorie = categorie;
    let finalPriorite  = priorite || 'FAIBLE';
    let analyseDoc     = null;

    const hasAiFromPreview = priorite && ['ELEVEE', 'MOYENNE', 'FAIBLE'].includes(priorite);

    // [FIX] Always run Vision API and save AnalyseIA document
    // Whether preview AI ran or not — admin and agent need the AI score visible
    try {
      const fs        = require('fs');
      const path      = require('path');
      const imgPath   = path.join(__dirname, '../public/images', req.file.filename);
      const imgBuffer = fs.readFileSync(imgPath);
      const base64Img = imgBuffer.toString('base64');

      const labels   = await analyzeImage(base64Img);
      const aiResult = analyzeReport(labels, 0, new Date());

      if (!hasAiFromPreview) {
        // No preview result — use Vision API result for priority and category
        finalCategorie = CATEGORY_MAP[aiResult.category] || categorie || 'AUTRE';
        finalPriorite  = PRIORITY_MAP[aiResult.priority]  || 'FAIBLE';
      }
      // If hasAiFromPreview → keep Flutter's priority/category, but still save AI score

      analyseDoc = await AnalyseIA.create({
        scoreConfiance:    aiResult.confidence,
        resultatCategorie: CATEGORY_MAP[aiResult.category] || finalCategorie || 'AUTRE',
        resultatPriorite:  finalPriorite,
        analyseImage:      req.file.filename,
        analyseTexte:      JSON.stringify({
          labels:   labels.slice(0, 5),
          score:    aiResult.score,
          isNight:  aiResult.isNight,
          category: aiResult.category,
          priority: aiResult.priority,
        }),
      });

      console.log(`[createSignalement] AnalyseIA saved | score: ${aiResult.confidence} | priorite: ${finalPriorite}`);
    } catch (aiError) {
      console.error('[createSignalement] AI pipeline error:', aiError.message);
    }

    const signalement = new Signalement({
      description:    description.trim(),
      localisation,
      priorite:       finalPriorite,
      categorie:      finalCategorie,
      citoyen,
      photo:          req.file.filename,
      municipalityId: req.user.municipalityId,
      analyseIA:      analyseDoc ? analyseDoc._id : null,
    });

    await signalement.save();

    if (analyseDoc) {
      analyseDoc.signalement = signalement._id;
      await analyseDoc.save();
    }

    return res.status(201).json({
      success: true,
      message: "Signalement créé avec succès",
      data:    signalement,
      ai:      analyseDoc ? {
        category:   analyseDoc.resultatCategorie,
        priorite:   analyseDoc.resultatPriorite,
        confidence: analyseDoc.scoreConfiance,
      } : null,
    });

  } catch (error) {
    console.error('[createSignalement] Fatal error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllSignalements = async (req, res) => {
  try {
    if (!req.user?.municipalityId) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : municipalité non définie",
      });
    }

    const signalements = await Signalement.find({
      municipalityId: req.user.municipalityId,
    })
      .populate('citoyen',       '-motDePasse')
      .populate('agent',         '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');

    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSignalementById = async (req, res) => {
  try {
    if (!req.user?.municipalityId) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : municipalité non définie",
      });
    }

    const signalement = await Signalement.findOne({
      _id:            req.params.id,
      municipalityId: req.user.municipalityId,
    })
      .populate('citoyen',       '-motDePasse')
      .populate('agent',         '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');

    if (!signalement)
      return res.status(404).json({ success: false, message: "Signalement non trouvé" });

    res.status(200).json({ data: signalement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSignalementsByCitoyen = async (req, res) => {
  try {
    const signalements = await Signalement.find({ citoyen: req.params.citoyenId })
      .populate('categorie')
      .populate('agent',    '-motDePasse')
      .populate('analyseIA')
      .populate('notifications');

    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.traiterSignalement = async (req, res) => {
  try {
    const { agent } = req.body;
    if (!agent)
      return res.status(400).json({ success: false, message: "L'id de l'agent est requis" });

    if (!req.user?.municipalityId)
      return res.status(403).json({ success: false, message: "Accès refusé : municipalité non définie" });

    const signalement = await Signalement.findOne({
      _id:            req.params.id,
      municipalityId: req.user.municipalityId,
    });

    if (!signalement)
      return res.status(404).json({ success: false, message: "Signalement non trouvé" });

    signalement.agent  = agent;
    signalement.statut = 'EN_COURS';
    await signalement.save();

    try {
      const citoyenId = signalement.citoyen.toString();
      const desc = signalement.description.length > 40
        ? signalement.description.substring(0, 40) + '...'
        : signalement.description;

      await new Notification({
        message:      `⚡ Votre signalement "${desc}" est en cours de traitement`,
        type:         'EN_COURS',
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false,
      }).save();
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({ success: true, message: "Signalement pris en charge", data: signalement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.changerStatutSignalement = async (req, res) => {
  try {
    const { statut }     = req.body;
    const allowedStatuts = ['EN_ATTENTE', 'EN_COURS', 'RESOLU'];

    if (!statut || !allowedStatuts.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées: ${allowedStatuts.join(', ')}`,
      });
    }

    if (!req.user?.municipalityId)
      return res.status(403).json({ success: false, message: "Accès refusé : municipalité non définie" });

    const signalement = await Signalement.findOne({
      _id:            req.params.id,
      municipalityId: req.user.municipalityId,
    });

    if (!signalement)
      return res.status(404).json({ success: false, message: "Signalement non trouvé" });

    signalement.statut = statut;

    if (statut === 'RESOLU' && req.file) {
      signalement.photoResolution = req.file.filename;
      console.log(`[SIGNALEMENT] Resolution photo saved: ${req.file.filename}`);
    }

    await signalement.save();

    try {
      const citoyenId = signalement.citoyen.toString();
      const desc = signalement.description.length > 40
        ? signalement.description.substring(0, 40) + '...'
        : signalement.description;

      let message, type;
      if (statut === 'EN_COURS') {
        message = `⚡ Votre signalement "${desc}" est en cours de traitement`;
        type    = 'EN_COURS';
      } else if (statut === 'RESOLU') {
        message = `✅ Votre signalement "${desc}" a été résolu avec succès !`;
        type    = 'RESOLU';
      } else {
        message = `ℹ️ Votre signalement "${desc}" est en attente`;
        type    = 'EN_ATTENTE';
      }

      await new Notification({
        message, type,
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false,
      }).save();
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({ success: true, message: "Statut mis à jour avec succès", data: signalement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSignalement = async (req, res) => {
  try {
    if (!req.user?.municipalityId)
      return res.status(403).json({ success: false, message: "Accès refusé : municipalité non définie" });

    const signalement = await Signalement.findOne({
      _id:            req.params.id,
      municipalityId: req.user.municipalityId,
    });

    if (!signalement)
      return res.status(404).json({ success: false, message: "Signalement non trouvé" });

    await Signalement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Signalement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};