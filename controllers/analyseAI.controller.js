const { analyzeImage } = require('../services/visionService');
const { analyzeReport } = require('../services/aiEngine');
const AnalyseIA   = require('../models/analyseAI.model');
const Signalement = require('../models/signalement.model');

/* ── analyserTexte() — from diagram ── */
exports.analyserTexte = async (req, res) => {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    const existing = await AnalyseIA.findOne({ signalement: signalementId });
    if (existing) {
      return res.status(409).json({
        message: "Une analyse existe déjà pour ce signalement",
        data:    existing
      });
    }

    const resultat = analyseTexteIA(signalement.description);

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance:    resultat.scoreConfiance,
      resultatCategorie: resultat.resultatCategorie,
      resultatPriorite:  resultat.resultatPriorite,
      analyseTexte:      signalement.description
    });

    await analyse.save();

    await Signalement.findByIdAndUpdate(signalementId, {
      analyseIA: analyse._id,
      priorite:  resultat.resultatPriorite
    });

    res.status(201).json({
      message: "Analyse texte effectuée avec succès",
      data:    analyse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── analyserImage() — NOW POWERED BY GEMINI AI ── */
exports.analyserImage = async (req, res) => {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    if (!signalement.photo) {
      return res.status(400).json({ message: "Ce signalement n'a pas de photo à analyser" });
    }

    const existing = await AnalyseIA.findOne({ signalement: signalementId });
    if (existing) {
      return res.status(409).json({
        message: "Une analyse existe déjà pour ce signalement",
        data:    existing
      });
    }

    // Call Gemini Vision API
    let labels = [];
    try {
      labels = await analyzeImage(signalement.photo);
      console.log("[AnalyseAI] Gemini labels:", labels);
    } catch (visionErr) {
      console.error("[AnalyseAI] Gemini error:", visionErr.message);
    }

    // Count zone repetitions
    let zoneRepetition = 0;
    if (signalement.localisation && signalement.localisation.zone) {
      zoneRepetition = await Signalement.countDocuments({
        'localisation.zone': signalement.localisation.zone
      });
    }

    // Run AI engine with priority formula
    const aiResult = analyzeReport(labels, zoneRepetition, new Date());
    console.log("[AnalyseAI] AI Result:", aiResult);

    // Map aiEngine category → your existing enum values
    const categoryMap = {
      road:           'VOIRIE',
      waste:          'PROPRETE',
      lighting:       'ECLAIRAGE',
      danger:         'VOIRIE',
      infrastructure: 'ESPACES_VERTS',
      other:          'AUTRE',
    };

    // Map aiEngine priority → your existing enum values
    const priorityMap = {
      critical: 'ELEVEE',
      high:     'ELEVEE',
      medium:   'MOYENNE',
      low:      'FAIBLE',
    };

    const resultatCategorie = categoryMap[aiResult.category]  || 'AUTRE';
    const resultatPriorite  = priorityMap[aiResult.priority]  || 'FAIBLE';
    const scoreConfiance    = aiResult.confidence;

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance,
      resultatCategorie,
      resultatPriorite,
      analyseImage:      signalement.photo,
      // Store extra AI data in analyseTexte field for reference
      analyseTexte:      JSON.stringify({
        labels:    labels.slice(0, 5),
        score:     aiResult.score,
        isNight:   aiResult.isNight,
        category:  aiResult.category,
        priority:  aiResult.priority,
      })
    });

    await analyse.save();

    await Signalement.findByIdAndUpdate(signalementId, {
      analyseIA: analyse._id,
      priorite:  resultatPriorite
    });

    res.status(201).json({
      message: "Analyse image effectuée avec succès (Gemini AI)",
      data:    analyse,
      ai: {
        category:   aiResult.category,
        priority:   aiResult.priority,
        score:      aiResult.score,
        confidence: aiResult.confidence,
        labels:     labels.slice(0, 5),
      }
    });
  } catch (error) {
    console.error("[AnalyseAI] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ── analyzeSignalement() — called directly with Base64 image from Flutter ── */
exports.analyzeSignalement = async (req, res) => {
  try {
    const { image, signalementId, zone } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "image (Base64) is required." });
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");

    let labels = [];
    try {
      labels = await analyzeImage(base64);
      console.log("[AnalyseAI] Gemini labels:", labels);
    } catch (visionErr) {
      console.error("[AnalyseAI] Vision error:", visionErr.message);
    }

    let zoneRepetition = 0;
    if (zone) {
      zoneRepetition = await Signalement.countDocuments({ zone });
    }

    const aiResult = analyzeReport(labels, zoneRepetition, new Date());

    const categoryMap = {
      road:           'VOIRIE',
      waste:          'PROPRETE',
      lighting:       'ECLAIRAGE',
      danger:         'VOIRIE',
      infrastructure: 'ESPACES_VERTS',
      other:          'AUTRE',
    };
    const priorityMap = {
      critical: 'ELEVEE',
      high:     'ELEVEE',
      medium:   'MOYENNE',
      low:      'FAIBLE',
    };

    const analyseDoc = await AnalyseIA.create({
      signalement:       signalementId || null,
      scoreConfiance:    aiResult.confidence,
      resultatCategorie: categoryMap[aiResult.category] || 'AUTRE',
      resultatPriorite:  priorityMap[aiResult.priority] || 'FAIBLE',
      analyseImage:      base64.substring(0, 100),
      analyseTexte:      JSON.stringify({
        labels:   labels.slice(0, 5),
        score:    aiResult.score,
        isNight:  aiResult.isNight,
        category: aiResult.category,
        priority: aiResult.priority,
      }),
    });

    if (signalementId) {
      await Signalement.findByIdAndUpdate(signalementId, {
        analyseIA: analyseDoc._id,
        priorite:  priorityMap[aiResult.priority] || 'FAIBLE',
      });
    }

    return res.status(201).json({
      success:   true,
      analyseId: analyseDoc._id,
      ai: {
        category:   aiResult.category,
        priority:   aiResult.priority,
        score:      aiResult.score,
        confidence: aiResult.confidence,
        isNight:    aiResult.isNight,
        labels:     labels.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("[AnalyseAI Controller] Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ── getAnalyseBySignalement() ── */
exports.getAnalyseBySignalement = async (req, res) => {
  try {
    const analyse = await AnalyseIA.findOne({ signalement: req.params.signalementId })
      .populate({
        path:   'signalement',
        select: 'description statut priorite localisation photo'
      });

    if (!analyse) {
      return res.status(404).json({ message: "Analyse non trouvée pour ce signalement" });
    }

    res.status(200).json({ data: analyse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getAllAnalyses() — for Admin dashboard ── */
exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await AnalyseIA.find()
      .populate({
        path:   'signalement',
        select: 'description statut priorite localisation'
      })
      .sort({ dateAnalyse: -1 });

    res.status(200).json({ data: analyses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── deleteAnalyse() ── */
exports.deleteAnalyse = async (req, res) => {
  try {
    const analyse = await AnalyseIA.findById(req.params.id);
    if (!analyse) {
      return res.status(404).json({ message: "Analyse non trouvée" });
    }

    await Signalement.findByIdAndUpdate(analyse.signalement, {
      analyseIA: null
    });

    await AnalyseIA.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Analyse supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ────────────────────────────────────────────────
   AI LOGIC HELPERS
──────────────────────────────────────────────── */
function analyseTexteIA(description) {
  const text = description.toLowerCase();

  let resultatCategorie = 'AUTRE';
  let resultatPriorite  = 'FAIBLE';
  let scoreConfiance    = 0.5;

  if (text.includes('route') || text.includes('trottoir') || text.includes('nid')) {
    resultatCategorie = 'VOIRIE';
    resultatPriorite  = 'ELEVEE';
    scoreConfiance    = 0.80;
  } else if (text.includes('lumière') || text.includes('lampadaire') || text.includes('éclairage')) {
    resultatCategorie = 'ECLAIRAGE';
    resultatPriorite  = 'MOYENNE';
    scoreConfiance    = 0.75;
  } else if (text.includes('déchet') || text.includes('poubelle') || text.includes('propre')) {
    resultatCategorie = 'PROPRETE';
    resultatPriorite  = 'MOYENNE';
    scoreConfiance    = 0.70;
  } else if (text.includes('arbre') || text.includes('parc') || text.includes('jardin')) {
    resultatCategorie = 'ESPACES_VERTS';
    resultatPriorite  = 'FAIBLE';
    scoreConfiance    = 0.65;
  }

  return { resultatCategorie, resultatPriorite, scoreConfiance };
}

function analyseImageIA(photoFilename) {
  return {
    resultatCategorie: 'AUTRE',
    resultatPriorite:  'FAIBLE',
    scoreConfiance:    0.5
  };
}