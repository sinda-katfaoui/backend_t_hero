const mongoose = require('mongoose');

const analyseAISchema = new mongoose.Schema({
    scoreConfiance: { type: Number },
    resultatCategorie: { type: String },
    resultatPriorite: { type: String },

    signalement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signalement',
        unique: true
    }
});

module.exports = mongoose.model('AnalyseAI', analyseAISchema);