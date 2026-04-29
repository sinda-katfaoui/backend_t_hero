/**
 * ============================================================
 * FICHIER  : users.routes.js
 * RÔLE     : Définition de toutes les routes liées aux utilisateurs
 * RESPONSABILITÉ : Mapper chaque URL HTTP vers le contrôleur approprié
 * PLACE    : Couche "routes/" — reçoit les requêtes et les redirige
 *            vers les contrôleurs ou la logique inline
 * FONCTIONNALITÉ : Gestion des comptes (citoyens, admins, agents municipaux)
 *                  avec authentification, upload d'image et journalisation
 * ============================================================
 */

const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadfile");
const logMiddleware = require("../middlewares/LogMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");

// Applique le middleware de journalisation sur toutes les routes de ce fichier
router.use(logMiddleware);

/* ── UTILISATEUR ROUTES ── */

// Connexion d'un utilisateur (génère un token JWT)
router.post("/login",  userController.login);

// Déconnexion — nécessite d'être authentifié (token valide obligatoire)
router.post("/logout", requireAuth, userController.logout);

/* ── CITOYEN ROUTES ── */

// Création d'un compte citoyen sans image de profil
router.post("/CreateUser",          userController.createUser);

// Création d'un compte citoyen avec upload d'une image de profil (champ "user_image")
router.post("/CreateUserWithImage", upload.single("user_image"), userController.createUserWithImage);

/* ── ADMIN ROUTES ── */

// Création d'un compte administrateur
router.post("/CreateUserAdmin",       userController.createUserAdmin);

// Récupération de tous les utilisateurs
router.get("/GetAllUsers",            userController.getAllUsers);

// Récupération d'un utilisateur spécifique par son identifiant MongoDB
router.get("/GetUserById/:id",        userController.getUserById);

// Mise à jour des informations d'un utilisateur
router.put("/UpdateUser/:id",         userController.updateUser);

// Changement de mot de passe d'un utilisateur
router.put("/ChangePassword/:id",     userController.changePassword);

// Blocage / déblocage d'un utilisateur — requiert une authentification
router.put("/ToggleBlock/:id",        requireAuth, userController.toggleBlock); // ✅ NEW

// Suppression d'un utilisateur par son identifiant
router.delete("/DeleteUser/:id",      userController.deleteUser);

/* ── AGENT MUNICIPAL ROUTES ── */

// Création d'un compte agent municipal
router.post("/CreateAgent",           userController.createUserAgentMunicipal);

/**
 * Récupération de tous les agents municipaux
 * Logique inline : filtre les utilisateurs ayant le rôle "AGENT_MUNICIPAL"
 * et exclut le mot de passe des données retournées pour des raisons de sécurité
 */
router.get("/GetAllAgents", async (req, res) => {
  try {
    const agents = await User.find({ role: "AGENT_MUNICIPAL" }).select("-motDePasse");
    res.status(200).json({ data: agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Récupération d'un agent municipal par son identifiant
 * Vérifie à la fois l'_id ET le rôle pour s'assurer que l'utilisateur
 * est bien un agent municipal (double condition de sécurité)
 */
router.get("/GetAgentById/:id", async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: "AGENT_MUNICIPAL"
    }).select("-motDePasse");

    // Retourne 404 si aucun agent ne correspond à cet identifiant
    if (!agent) return res.status(404).json({ message: "Agent Municipal non trouvé" });
    res.status(200).json({ data: agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mise à jour d'un agent municipal (réutilise le contrôleur updateUser)
router.put("/UpdateAgent/:id",    userController.updateUser);

// Suppression d'un agent municipal (réutilise le contrôleur deleteUser)
router.delete("/DeleteAgent/:id", userController.deleteUser);

// Exporte le routeur pour être monté dans app.js
module.exports = router;