/**
 * ============================================================
 * FICHIER  : municipality.model.js
 * RÔLE     : Définition du schéma de données des municipalités
 * ============================================================
 */

const mongoose = require("mongoose");

const municipalitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la municipalité est requis"],
      trim: true,
    },
    governorate: {
      type: String,
      required: [true, "Le gouvernorat est requis"],
      enum: [
        "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul",
        "Zaghouan", "Bizerte", "Béja", "Jendouba", "Le Kef",
        "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax",
        "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès",
        "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
      ],
    },
    invitationCode: {
      type: String,
      required: [true, "Le code d'invitation est requis"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Municipality", municipalitySchema);