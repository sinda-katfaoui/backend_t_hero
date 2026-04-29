/**
 * ============================================================
 * FICHIER  : notification.model.js
 * RÔLE     : Définition du schéma de données des notifications
 * RESPONSABILITÉ : Modéliser la structure d'une notification en base
 *                  de données et ses relations avec User et Signalement
 * PLACE    : Couche "models/" — interagit directement avec MongoDB
 *            via Mongoose, utilisé par notification.controller.js
 *            et signalement.controller.js (création automatique)
 * FONCTIONNALITÉ : Schéma de notification utilisateur — générée
 *                  automatiquement à chaque changement de statut d'un
 *                  signalement pour informer le citoyen concerné,
 *                  avec suivi de lecture et référence au signalement source
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose définissant la structure d'une notification
 * Une notification est créée automatiquement par signalement.controller.js
 * à chaque changement de statut, et envoyée au citoyen destinataire
 */
const notificationSchema = new mongoose.Schema(
  {
    // Contenu textuel du message affiché à l'utilisateur
    message:   { type: String, required: true },

    // Date d'envoi de la notification (automatiquement définie à la création)
    dateEnvoi: { type: Date, default: Date.now },

    /**
     * Type de notification — indique la nature de l'événement déclencheur
     * Aligné sur les statuts du cycle de vie du signalement :
     * - NOUVEAU_SIGNALEMENT : un nouveau signalement a été créé
     * - STATUT_CHANGE       : le statut du signalement a changé
     * - SIGNALEMENT_RESOLU  : le signalement a été résolu
     * - EN_ATTENTE          : le signalement est en attente de traitement
     * - EN_COURS            : le signalement est en cours de traitement
     * - RESOLU              : le signalement a été résolu
     * - INFO                : notification informative générique (défaut)
     */
    type: {
      type:    String,
      enum:    [
        'NOUVEAU_SIGNALEMENT',
        'STATUT_CHANGE',
        'SIGNALEMENT_RESOLU',
        'INFO',
        'EN_COURS',
        'RESOLU',
        'EN_ATTENTE'
      ],
      default: 'INFO'
    },

    // Indique si la notification a été lue par le destinataire (false par défaut)
    lu: { type: Boolean, default: false },

    /**
     * Relation : User reçoit Notification (destinataire)
     * Référence obligatoire vers le modèle User
     * Correspond au citoyen qui a soumis le signalement concerné
     */
    destinataire: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    /**
     * Relation : Signalement génère Notification
     * Référence optionnelle vers le signalement à l'origine de la notification
     * Permet de retrouver le contexte complet depuis la notification
     */
    signalement: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Signalement'
    }
  },
  // timestamps : ajoute automatiquement les champs createdAt et updatedAt
  { timestamps: true }
);

// Exporte le modèle Mongoose "Notification" basé sur le schéma défini
module.exports = mongoose.model('Notification', notificationSchema);