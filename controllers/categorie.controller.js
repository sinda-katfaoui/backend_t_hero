const Categorie    = require('../models/categorie.model');
const Signalement  = require('../models/signalement.model');

/* ── createCategorie() ── */
exports.createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom est requis" });
    }

    // No duplicate category names
    const existing = await Categorie.findOne({ nom });
    if (existing) {
      return res.status(409).json({ message: "Cette catégorie existe déjà" });
    }

    const categorie = new Categorie({ nom, description });
    await categorie.save();

    res.status(201).json({
      message: "Catégorie créée avec succès",
      data:    categorie
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getAllCategories() ── */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 }); // alphabetical
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getCategorieById() ── */
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.status(200).json({ data: categorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Relation: get all signalements inside a categorie ── */
// From diagram: Categorie contient 0..* Signalements
exports.getSignalementsByCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    const signalements = await Signalement.find({ categorie: req.params.id })
      .populate('citoyen', '-motDePasse')
      .populate('agent',   '-motDePasse')
      .sort({ dateCreation: -1 });

    res.status(200).json({
      data: {
        categorie,
        signalements
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── updateCategorie() ── */
exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Check new nom not already taken by another category
    if (nom && nom !== categorie.nom) {
      const existing = await Categorie.findOne({ nom });
      if (existing) {
        return res.status(409).json({ message: "Ce nom de catégorie existe déjà" });
      }
    }

    const updated = await Categorie.findByIdAndUpdate(
      req.params.id,
      { nom, description },
      { new: true }
    );

    res.status(200).json({
      message: "Catégorie mise à jour avec succès",
      data:    updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── deleteCategorie() ── */
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Safety check — don't delete a category that has signalements linked to it
    const linked = await Signalement.countDocuments({ categorie: req.params.id });
    if (linked > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer: ${linked} signalement(s) utilisent cette catégorie`
      });
    }

    await Categorie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};