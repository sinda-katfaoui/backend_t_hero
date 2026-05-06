/**
 * ============================================================
 * FICHIER  : user.model.js
 * RÔLE     : Définition du schéma de données des utilisateurs
 * RESPONSABILITÉ : Modéliser la structure d'un utilisateur en base
 *                  de données et encapsuler la logique d'authentification
 * PLACE    : Couche "models/" — interagit directement avec MongoDB
 *            via Mongoose, utilisé par user.controller.js
 * FONCTIONNALITÉ : Schéma utilisateur multi-rôles (Citoyen, Agent,
 *                  Admin), hachage automatique du mot de passe avant
 *                  sauvegarde, méthode statique de connexion sécurisée
 *                  avec vérification bcrypt et contrôle du blocage
 * ============================================================
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

/**
 * Schéma Mongoose définissant la structure d'un utilisateur
 * - nom, email (unique), motDePasse (masqué par défaut)
 * - role : détermine les droits et accès dans l'application
 * - user_image : photo de profil (nom du fichier uploadé)
 * - code_Agent / code_Admin : codes d'identification spécifiques au rôle
 * - isBlocked : permet de bloquer l'accès sans supprimer le compte
 * - municipalityId : [ADDED] lie l'utilisateur à sa municipalité
 * - timestamps : ajoute automatiquement createdAt et updatedAt
 */
const userSchema = new mongoose.Schema(
  {
    nom:        { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    // select: false — le mot de passe est exclu de toutes les requêtes par défaut (sécurité)
    motDePasse: { type: String, required: true, select: false },
    role: {
      type:     String,
      enum:     ["CITOYEN", "AGENT_MUNICIPAL", "ADMIN"],
      required: true,
    },
    user_image: { type: String, default: "" },
    code_Agent: { type: Number },
    code_Admin: { type: Number },
    isBlocked:  { type: Boolean, default: false },

    // [ADDED] Référence vers la municipalité de l'utilisateur
    // Obligatoire pour l'isolation des données multi-municipalité
    municipalityId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Municipality",
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Hook Mongoose "pre-save" — exécuté automatiquement avant chaque sauvegarde
 * - Vérifie si le mot de passe a été modifié pour éviter un double hachage
 * - Génère un "salt" de complexité 10 pour renforcer la sécurité
 * - Remplace le mot de passe en clair par sa version hachée avec bcrypt
 */
userSchema.pre("save", async function () {
  if (!this.isModified("motDePasse")) return;
  const salt     = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

/**
 * Méthode statique de connexion — appelée via User.login(email, password)
 * Centralise toute la logique d'authentification dans le modèle
 * - Recherche l'utilisateur par email en forçant l'inclusion du mot de passe
 *   (nécessaire car select: false le masque par défaut)
 * - Compare le mot de passe fourni avec le hash stocké via bcrypt
 * - Vérifie que le compte n'est pas bloqué avant d'autoriser la connexion
 * - Lève des erreurs explicites pour chaque cas d'échec
 */
userSchema.statics.login = async function (email, password) {
  // select: false hides motDePasse by default — must explicitly request it
  const user = await this.findOne({ email }).select("+motDePasse");
  if (!user) throw new Error("Email incorrect");

  // Compare le mot de passe en clair avec le hash stocké en base
  const isMatch = await bcrypt.compare(password, user.motDePasse);
  if (!isMatch) throw new Error("Mot de passe incorrect");

  // Bloque la connexion si le compte a été désactivé par un administrateur
  if (user.isBlocked) throw new Error("Compte bloqué");

  return user;
};

// Exporte le modèle Mongoose "User" basé sur le schéma défini
module.exports = mongoose.model("User", userSchema);