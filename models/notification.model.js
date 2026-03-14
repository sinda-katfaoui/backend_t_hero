const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // From diagram: message, dateEnvoi, type
    message:   { type: String, required: true },

    dateEnvoi: { type: Date, default: Date.now },

    type: {
      type:    String,
      enum:    ['NOUVEAU_SIGNALEMENT', 'STATUT_CHANGE', 'SIGNALEMENT_RESOLU', 'INFO'],
      default: 'INFO'
    },

    // Not in diagram but essential for mobile — mark as read
    lu: { type: Boolean, default: false },

    // Relation: destinataire — Utilisateur receives 0..* notifications
    destinataire: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    // Relation: Signalement génère 0..* notifications
    signalement: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Signalement'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);