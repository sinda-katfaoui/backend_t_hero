/**
 * ============================================================
 * FICHIER  : categorie.controller.js
 * RÔLE     : Logique métier complète de la gestion des catégories
 * RESPONSABILITÉ : Traiter les requêtes HTTP et interagir avec
 *                  les modèles Categorie et Signalement
 * PLACE    : Couche "controllers/" — entre les routes et les modèles
 * FONCTIONNALITÉ : Création, consultation, mise à jour et suppression
 *                  des catégories de signalements, avec gestion de la
 *                  relation "Catégorie contient 0..* Signalements"
 *                  et protection contre la suppression de catégories
 *                  encore utilisées par des signalements existants
 * ============================================================
 */

const Categorie    = require('../models/categorie.model');
const Signalement  = require('../models/signalement.model');

/* ── createCategorie() ── */

/**
 * Création d'une nouvelle catégorie de signalement
 * - Vérifie la présence du champ obligatoire "nom"
 * - Vérifie l'unicité du nom pour éviter les doublons
 * - Sauvegarde la catégorie en base de données
 */
exports.createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom est requis" });
    }

    // Vérifie qu'aucune catégorie avec le même nom n'existe déjà
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

/**
 * Récupération de toutes les catégories
 * - Trie les résultats par ordre alphabétique sur le champ "nom"
 * - Accessible publiquement (utilisé par Flutter pour afficher la liste)
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 }); // alphabetical
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getCategorieById() ── */

/**
 * Récupération d'une catégorie précise par son identifiant MongoDB
 * - Retourne 404 si la catégorie n'existe pas
 */
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

/**
 * Récupération de tous les signalements appartenant à une catégorie
 * Implémente la relation du diagramme : Categorie contient 0..* Signalements
 * - Vérifie d'abord l'existence de la catégorie
 * - Retourne à la fois les infos de la catégorie ET ses signalements
 * - Peuple citoyen et agent (sans mot de passe) pour chaque signalement
 * - Trie les signalements par date de création décroissante
 */
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

    // Retourne un objet groupé : catégorie + liste de ses signalements
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

/**
 * Mise à jour d'une catégorie existante
 * - Vérifie l'existence de la catégorie avant modification
 * - Si le nom est modifié, vérifie qu'il n'est pas déjà pris
 *   par une autre catégorie (contrainte d'unicité)
 * - Retourne le document mis à jour
 */
exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Vérifie l'unicité du nouveau nom uniquement s'il est différent de l'actuel
    if (nom && nom !== categorie.nom) {
      const existing = await Categorie.findOne({ nom });
      if (existing) {
        return res.status(409).json({ message: "Ce nom de catégorie existe déjà" });
      }
    }

    const updated = await Categorie.findByIdAndUpdate(
      req.params.id,
      { nom, description },
      { new: true } // Retourne le document après modification
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

/**
 * Suppression définitive d'une catégorie
 * - Vérifie l'existence de la catégorie avant suppression
 * - PROTECTION D'INTÉGRITÉ : refuse la suppression si des signalements
 *   sont encore liés à cette catégorie (évite les références orphelines)
 * - Compte le nombre de signalements liés et l'affiche dans le message d'erreur
 */
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Vérifie qu'aucun signalement n'utilise encore cette catégorie
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