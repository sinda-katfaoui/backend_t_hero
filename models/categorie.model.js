// models/categorie.model.js
const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Categorie', categorieSchema);