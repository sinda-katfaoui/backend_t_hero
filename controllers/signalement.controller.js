const Signalement  = require('../models/signalement.model');
const Notification = require('../models/notification.model');

exports.createSignalement = async (req, res) => {
  try {
    const { description, localisation, priorite,
      categorie, citoyen } = req.body;
    if (!description || !localisation || !citoyen) {
      return res.status(400).json({
        message: "description, localisation et citoyen sont requis" });
    }
    const signalement = new Signalement({
      description, localisation, priorite, categorie, citoyen,
      photo: req.file ? req.file.filename : ""
    });
    await signalement.save();
    res.status(201).json({
      message: "Signalement créé avec succès",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSignalements = async (req, res) => {
  try {
    const signalements = await Signalement.find()
      .populate('citoyen',   '-motDePasse')
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');
    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSignalementById = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id)
      .populate('citoyen',   '-motDePasse')
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });
    res.status(200).json({ data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSignalementsByCitoyen = async (req, res) => {
  try {
    const signalements = await Signalement.find({
      citoyen: req.params.citoyenId })
      .populate('categorie')
      .populate('agent', '-motDePasse')
      .populate('analyseIA')
      .populate('notifications');
    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.traiterSignalement = async (req, res) => {
  try {
    const { agent } = req.body;
    if (!agent) return res.status(400).json({
      message: "L'id de l'agent est requis" });

    // ✅ NO populate — keep citoyen as raw ObjectId
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });

    signalement.agent  = agent;
    signalement.statut = 'EN_COURS';
    await signalement.save();

    // ✅ citoyen is raw ObjectId — use directly
    try {
      const citoyenId = signalement.citoyen.toString();
      const desc = signalement.description.length > 40
        ? signalement.description.substring(0, 40) + '...'
        : signalement.description;

      console.log('Creating notif for citoyen:', citoyenId);

      await new Notification({
        message:      `⚡ Votre signalement "${desc}" est en cours de traitement`,
        type:         'EN_COURS',
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false
      }).save();

      console.log('Notif created successfully');
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({
      message: "Signalement pris en charge",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changerStatutSignalement = async (req, res) => {
  try {
    const { statut } = req.body;
    const allowedStatuts = ['EN_ATTENTE', 'EN_COURS', 'RESOLU'];

    if (!statut || !allowedStatuts.includes(statut)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs acceptées: ${allowedStatuts.join(', ')}` });
    }

    // ✅ NO populate — keep citoyen as raw ObjectId
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });

    signalement.statut = statut;
    await signalement.save();

    // ✅ citoyen is raw ObjectId — use directly
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

      console.log('Creating notif for citoyen:', citoyenId);

      await new Notification({
        message,
        type,
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false
      }).save();

      console.log('Notif created successfully');
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({
      message: "Statut mis à jour avec succès",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSignalement = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });
    await Signalement.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Signalement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};