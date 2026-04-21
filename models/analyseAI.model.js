const mongoose = require('mongoose');

const analyseAISchema = new mongoose.Schema(
  {
    scoreConfiance: {
      type:    Number,
      min:     0,
      max:     1,
      default: 0
    },

    resultatCategorie: {
      type:    String,
      enum:    ['VOIRIE', 'ECLAIRAGE', 'PROPRETE', 'ESPACES_VERTS', 'AUTRE'],
      default: 'AUTRE'
    },

    resultatPriorite: {
      type:    String,
      enum:    ['FAIBLE', 'MOYENNE', 'ELEVEE'],
      default: 'FAIBLE'
    },

    dateAnalyse: { type: Date, default: Date.now },

    analyseTexte: { type: String, default: "" },
    analyseImage: { type: String, default: "" },

    signalement: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Signalement',
      required: false,
      default:  null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyseIA', analyseAISchema);