const AnalyseIA    = require('../models/analyseAI.model');
const Signalement  = require('../models/signalement.model');

/* ── analyserTexte() — from diagram ── */
// Analyses the text description of a signalement
exports.analyserTexte = async (req, res) => {
  try {
    const { signalementId } = req.params;

    // Check signalement exists
    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    // Check no analysis already exists for this signalement
    const existing = await AnalyseIA.findOne({ signalement: signalementId });
    if (existing) {
      return res.status(409).json({
        message: "Une analyse existe déjà pour ce signalement",
        data:    existing
      });
    }

    // AI logic: analyse the text description
    // This is where you plug your real AI model later
    const resultat = analyseTexteIA(signalement.description);

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance:    resultat.scoreConfiance,
      resultatCategorie: resultat.resultatCategorie,
      resultatPriorite:  resultat.resultatPriorite,
      analyseTexte:      signalement.description
    });

    await analyse.save();

    // Update signalement with the analysis result and suggested priority
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

/* ── analyserImage() — from diagram ── */
// Analyses the photo of a signalement
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

    // AI logic: analyse the image
    // This is where you plug your real AI model (e.g. Google Vision) later
    const resultat = analyseImageIA(signalement.photo);

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance:    resultat.scoreConfiance,
      resultatCategorie: resultat.resultatCategorie,
      resultatPriorite:  resultat.resultatPriorite,
      analyseImage:      signalement.photo
    });

    await analyse.save();

    await Signalement.findByIdAndUpdate(signalementId, {
      analyseIA: analyse._id,
      priorite:  resultat.resultatPriorite
    });

    res.status(201).json({
      message: "Analyse image effectuée avec succès",
      data:    analyse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    // Remove analyseIA reference from the signalement too
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
   Replace these with your real AI model calls
   e.g. Google Vision, OpenAI, HuggingFace, etc.
──────────────────────────────────────────────── */
function analyseTexteIA(description) {
  const text = description.toLowerCase();

  let resultatCategorie = 'AUTRE';
  let resultatPriorite  = 'FAIBLE';
  let scoreConfiance    = 0.5;

  // Simple keyword matching — replace with real AI later
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
  // Placeholder — plug Google Vision or your model here
  return {
    resultatCategorie: 'AUTRE',
    resultatPriorite:  'FAIBLE',
    scoreConfiance:    0.5
  };
}