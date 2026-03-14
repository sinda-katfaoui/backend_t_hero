const mongoose = require('mongoose');

const analyseAISchema = new mongoose.Schema(
  {
    // From diagram: scoreConfiance, resultatCategorie, resultatPriorite
    scoreConfiance: {
      type:    Number,
      min:     0,
      max:     1,         // confidence score is always between 0 and 1
      default: 0
    },

    resultatCategorie: {
      type: String,
      enum: ['VOIRIE', 'ECLAIRAGE', 'PROPRETE', 'ESPACES_VERTS', 'AUTRE'],
      default: 'AUTRE'
    },

    resultatPriorite: {
      type:    String,
      enum:    ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE'
    },

    // Track when AI ran the analysis
    dateAnalyse: { type: Date, default: Date.now },

    // Store the raw AI response for debugging
    analyseTexte: { type: String, default: "" },
    analyseImage: { type: String, default: "" },

    // Relation: AnalyseIA analyse par Signalement (0..1 per signalement)
    signalement: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Signalement',
      required: true,
      unique:   true       // one analysis per signalement max
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyseIA', analyseAISchema);