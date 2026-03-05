const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String },

    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    signalement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signalement'
    }
});

module.exports = mongoose.model('Notification', notificationSchema);