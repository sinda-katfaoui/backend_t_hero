/**
 * ============================================================
 * FICHIER  : signalement.model.js
 * RÔLE     : Définition du schéma de données des signalements
 * RESPONSABILITÉ : Modéliser la structure d'un signalement en base
 *                  de données et ses relations avec les autres entités
 * PLACE    : Couche "models/" — interagit directement avec MongoDB
 *            via Mongoose, utilisé par signalement.controller.js
 * FONCTIONNALITÉ : Schéma central du projet — un signalement possède
 *                  un statut, une priorité, une localisation et une photo,
 *                  et est relié au citoyen créateur, à la catégorie,
 *                  à l'agent traitant, à l'analyse IA et aux notifications
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose définissant la structure complète d'un signalement
 * Entité centrale du projet T Hero — relie toutes les autres entités
 * Champs issus du diagramme de classes : description, dateCreation,
 * statut, priorite, localisation, photo
 */
const signalementSchema = new mongoose.Schema(
  {
    // From diagram: description, dateCreation, statut, priorite, localisation, photo

    // Description textuelle du problème signalé par le citoyen
    description:  { type: String, required: true },

    // Date de création du signalement (automatiquement définie à la création)
    dateCreation: { type: Date, default: Date.now },

    /**
     * Statut du signalement — représente le cycle de vie du traitement :
     * EN_ATTENTE (initial) → EN_COURS (pris en charge) → RESOLU (clôturé)
     */
    statut: {
      type:    String,
      enum:    ['EN_ATTENTE', 'EN_COURS', 'RESOLU'],
      default: 'EN_ATTENTE'
    },

    /**
     * Niveau de priorité du signalement
     * Calculé automatiquement par le moteur IA lors de l'analyse
     */
    priorite: {
      type: String,
      enum: ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE'
    },

    // Localisation géographique du problème signalé
    localisation: { type: String, required: true },

    // Nom du fichier photo joint au signalement (géré par uploadfile middleware)
    photo:        { type: String, default: "" },

    /**
     * Relation : Citoyen crée Signalement (1 citoyen → 0..* signalements)
     * Référence obligatoire vers le modèle User (rôle CITOYEN)
     */
    citoyen: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    /**
     * Relation : Categorie contient Signalement (1 catégorie → 0..* signalements)
     * Référence optionnelle vers le modèle Categorie
     */
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Categorie'
    },

    /**
     * Relation : AgentMunicipal traite Signalement (0..1 agent → 0..* signalements)
     * Référence optionnelle vers le modèle User (rôle AGENT_MUNICIPAL)
     * Renseignée lors de la prise en charge via traiterSignalement()
     */
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    },

    /**
     * Relation : AnalyseIA analyse Signalement (0..1 analyse par signalement)
     * Référence optionnelle vers le modèle AnalyseIA
     * Renseignée après l'analyse du signalement par l'IA
     */
    analyseIA: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'AnalyseIA'
    },

    /**
     * Relation : Signalement génère Notification (0..* notifications)
     * Tableau de références vers le modèle Notification
     * Une notification est créée à chaque changement de statut
     */
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Notification'
      }
    ]
  },
  // timestamps : ajoute automatiquement les champs createdAt et updatedAt
  { timestamps: true }
);

// Exporte le modèle Mongoose "Signalement" basé sur le schéma défini
module.exports = mongoose.model('Signalement', signalementSchema);