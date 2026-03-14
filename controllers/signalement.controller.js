const Signalement = require('../models/signalement.model');

/* ── creerSignalement() — Citoyen creates a signalement ── */
exports.createSignalement = async (req, res) => {
  try {
    const { description, localisation, priorite, categorie, citoyen } = req.body;

    if (!description || !localisation || !citoyen) {
      return res.status(400).json({ message: "description, localisation et citoyen sont requis" });
    }

    const signalement = new Signalement({
      description,
      localisation,
      priorite,
      categorie,
      citoyen,
      photo: req.file ? req.file.filename : ""
    });

    await signalement.save();

    res.status(201).json({
      message: "Signalement créé avec succès",
      data: signalement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── consulterSignalements() — Get all signalements ── */
exports.getAllSignalements = async (req, res) => {
  try {
    const signalements = await Signalement.find()
      .populate('citoyen',   '-motDePasse')  // never expose password
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');

    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Get signalement by ID ── */
exports.getSignalementById = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id)
      .populate('citoyen',   '-motDePasse')
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');

    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    res.status(200).json({ data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Get signalements by citoyen ── */
exports.getSignalementsByCitoyen = async (req, res) => {
  try {
    const signalements = await Signalement.find({ citoyen: req.params.citoyenId })
      .populate('categorie')
      .populate('agent', '-motDePasse')
      .populate('analyseIA')
      .populate('notifications');

    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── traiterSignalement() — AgentMunicipal assigns himself ── */
exports.traiterSignalement = async (req, res) => {
  try {
    const { agent } = req.body;

    if (!agent) {
      return res.status(400).json({ message: "L'id de l'agent est requis" });
    }

    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    signalement.agent  = agent;
    signalement.statut = 'EN_COURS';
    await signalement.save();

    res.status(200).json({
      message: "Signalement pris en charge",
      data: signalement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── changerStatutSignalement() — AgentMunicipal changes status ── */
exports.changerStatutSignalement = async (req, res) => {
  try {
    const { statut } = req.body;
    const allowedStatuts = ['EN_ATTENTE', 'EN_COURS', 'RESOLU'];

    if (!statut || !allowedStatuts.includes(statut)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs acceptées: ${allowedStatuts.join(', ')}`
      });
    }

    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    signalement.statut = statut;
    await signalement.save();

    res.status(200).json({
      message: "Statut mis à jour avec succès",
      data: signalement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Delete signalement ── */
exports.deleteSignalement = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    await Signalement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Signalement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};