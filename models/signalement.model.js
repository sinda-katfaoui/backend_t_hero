const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema(
  {
    // From diagram: description, dateCreation, statut, priorite, localisation, photo
    description:  { type: String, required: true },
    dateCreation: { type: Date, default: Date.now },

    statut: {
      type:    String,
      enum:    ['EN_ATTENTE', 'EN_COURS', 'RESOLU'],
      default: 'EN_ATTENTE'
    },

    priorite: {
      type: String,
      enum: ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE'
    },

    localisation: { type: String, required: true },
    photo:        { type: String, default: "" },

    // Relation: Citoyen crée Signalement (1 citoyen → 0..* signalements)
    citoyen: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    // Relation: Categorie contient Signalement (1 categorie → 0..* signalements)
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Categorie'
    },

    // Relation: AgentMunicipal traite Signalement (0..1 agent → 0..* signalements)
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    },

    // Relation: AnalyseIA analyse Signalement (0..1 analyse par signalement)
    analyseIA: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'AnalyseIA'
    },

    // Relation: Signalement génère Notification (0..* notifications)
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Notification'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Signalement', signalementSchema);