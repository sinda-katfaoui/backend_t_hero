const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema(
  {
    // From diagram: nom, description
    nom:         { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categorie', categorieSchema);