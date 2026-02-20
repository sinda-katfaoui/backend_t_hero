// controllers/categorie.controller.js
const Categorie = require('../models/categorie.model');

// Créer une catégorie
exports.createCategorie = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategorie = new Categorie({ name, description });
    const savedCategorie = await newCategorie.save();
    res.status(201).json(savedCategorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une catégorie par ID
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Categorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une catégorie
exports.updateCategorie = async (req, res) => {
  try {
    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategorie) return res.status(404).json({ message: 'Categorie non trouvée' });
    res.json(updatedCategorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une catégorie
exports.deleteCategorie = async (req, res) => {
  try {
    const deletedCategorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!deletedCategorie) return res.status(404).json({ message: 'Categorie non trouvée' });
    res.json({ message: 'Categorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};