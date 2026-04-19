const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    message:   { type: String, required: true },
    dateEnvoi: { type: Date, default: Date.now },
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
    lu: { type: Boolean, default: false },
    destinataire: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    signalement: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Signalement'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);