const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: {
        type: String,
        enum: ['CITOYEN', 'AGENT_MUNICIPAL', 'ADMIN'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Utilisateur', userSchema);