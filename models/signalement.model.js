const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
    description: { type: String, required: true },
    dateCreation: { type: Date, default: Date.now },
    statut: {
        type: String,
        enum: ['EN_ATTENTE', 'EN_COURS', 'RESOLU'],
        default: 'EN_ATTENTE'
    },
    priorite: {
        type: String,
        enum: ['FAIBLE', 'MOYENNE', 'ELEVEE']
    },
    localisation: { type: String },
    photo: { type: String },

    citoyen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },

    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie'
    },

    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    }
});

module.exports = mongoose.model('Signalement', signalementSchema);