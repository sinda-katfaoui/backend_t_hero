const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema(
  {
    description:  { type: String, required: true },
    dateCreation: { type: Date, default: Date.now },

    statut: {
      type:    String,
      enum:    ['EN_ATTENTE', 'EN_COURS', 'RESOLU'],
      default: 'EN_ATTENTE',
    },

    priorite: {
      type:    String,
      enum:    ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE',
    },

    localisation: { type: String, required: true },

    // Photo du problème soumise par le citoyen
    photo: { type: String, default: "" },

    // [ADDED] Photo de résolution uploadée par l'agent quand statut = RESOLU
    photoResolution: { type: String, default: "" },

    citoyen: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Categorie',
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },

    analyseIA: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'AnalyseIA',
    },

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Notification',
      },
    ],

    municipalityId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Municipality',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Signalement', signalementSchema);