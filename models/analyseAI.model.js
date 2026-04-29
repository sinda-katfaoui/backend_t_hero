/**
 * ============================================================
 * FICHIER  : analyseAI.model.js
 * RÔLE     : Définition du schéma de données des analyses IA
 * RESPONSABILITÉ : Modéliser la structure d'un résultat d'analyse
 *                  intelligente en base de données MongoDB via Mongoose
 * PLACE    : Couche "models/" — utilisé par analyseAI.controller.js
 *            et référencé dans signalement.model.js (champ analyseIA)
 * FONCTIONNALITÉ : Stocke les résultats produits par Google Vision API
 *                  et le moteur IA (aiEngine) : catégorie détectée,
 *                  priorité calculée, score de confiance, et données
 *                  brutes de l'analyse texte et image
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose définissant la structure d'une analyse IA
 * Créée automatiquement par analyseAI.controller.js après traitement
 * d'un signalement par Google Vision API et le moteur aiEngine
 */
const analyseAISchema = new mongoose.Schema(
  {
    /**
     * Score de confiance du résultat produit par le moteur IA
     * Valeur comprise entre 0 (aucune confiance) et 1 (confiance totale)
     * Calculé par aiEngine selon les labels retournés par Google Vision API
     */
    scoreConfiance: {
      type:    Number,
      min:     0,
      max:     1,
      default: 0
    },

    /**
     * Catégorie de problème détectée par l'analyse IA
     * Mappée depuis les labels Google Vision vers les valeurs métier du projet :
     * VOIRIE, ECLAIRAGE, PROPRETE, ESPACES_VERTS ou AUTRE (défaut)
     */
    resultatCategorie: {
      type:    String,
      enum:    ['VOIRIE', 'ECLAIRAGE', 'PROPRETE', 'ESPACES_VERTS', 'AUTRE'],
      default: 'AUTRE'
    },

    /**
     * Niveau de priorité calculé par le moteur IA
     * Basé sur les labels détectés, la répétition de zone et l'heure
     * Appliqué automatiquement au signalement lié après l'analyse
     */
    resultatPriorite: {
      type:    String,
      enum:    ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE'
    },

    // Date à laquelle l'analyse a été effectuée (automatiquement définie à la création)
    dateAnalyse: { type: Date, default: Date.now },

    /**
     * Résultat brut de l'analyse textuelle
     * Contient la description originale du signalement ou les métadonnées
     * JSON de l'analyse IA (labels, score, catégorie, priorité, isNight)
     */
    analyseTexte: { type: String, default: "" },

    /**
     * Référence à l'image analysée
     * Contient le nom du fichier photo ou les 100 premiers caractères
     * du Base64 de l'image envoyée directement depuis Flutter
     */
    analyseImage: { type: String, default: "" },

    /**
     * Relation : AnalyseIA analyse Signalement (0..1 analyse par signalement)
     * Référence optionnelle vers le signalement source de l'analyse
     * Peut être null pour les analyses directes depuis Flutter sans signalement lié
     */
    signalement: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Signalement',
      required: false,
      default:  null,
    }
  },
  // timestamps : ajoute automatiquement les champs createdAt et updatedAt
  { timestamps: true }
);

// Exporte le modèle Mongoose "AnalyseIA" basé sur le schéma défini
module.exports = mongoose.model('AnalyseIA', analyseAISchema);