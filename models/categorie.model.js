/**
 * ============================================================
 * FICHIER  : categorie.model.js
 * RÔLE     : Définition du schéma de données des catégories
 * RESPONSABILITÉ : Modéliser la structure d'une catégorie en base
 *                  de données MongoDB via Mongoose
 * PLACE    : Couche "models/" — utilisé par categorie.controller.js
 *            et signalement.model.js (référence via ObjectId)
 * FONCTIONNALITÉ : Schéma simple de classification des signalements —
 *                  chaque signalement appartient à une catégorie,
 *                  permettant de filtrer et organiser les signalements
 *                  par type de problème (voirie, propreté, éclairage...)
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose définissant la structure d'une catégorie
 * Champs issus du diagramme de classes : nom, description
 * - nom unique et nettoyé des espaces (trim) pour éviter les doublons
 * - timestamps : ajoute automatiquement createdAt et updatedAt
 */
const categorieSchema = new mongoose.Schema(
  {
    // From diagram: nom, description

    // Nom de la catégorie — obligatoire, unique et sans espaces superflus
    nom:         { type: String, required: true, unique: true, trim: true },

    // Description optionnelle de la catégorie (vide par défaut)
    description: { type: String, default: "" }
  },
  // timestamps : ajoute automatiquement les champs createdAt et updatedAt
  { timestamps: true }
);

// Exporte le modèle Mongoose "Categorie" basé sur le schéma défini
module.exports = mongoose.model('Categorie', categorieSchema);