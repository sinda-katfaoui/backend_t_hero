/**
 * ============================================================
 * FICHIER  : users.routes.js
 * [FIXED]  : requireAuth ajouté sur toutes les routes protégées
 *            Routes inline GetAllAgents / GetAgentById corrigées
 *            avec filtre municipalityId strict
 * ============================================================
 */

const express    = require("express");
const router     = express.Router();
const User       = require("../models/user.model");

const userController  = require("../controllers/user.controller");
const upload          = require("../middlewares/uploadfile");
const logMiddleware   = require("../middlewares/LogMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(logMiddleware);

/* ── AUTH ROUTES ── */

// Public — pas besoin d'auth pour se connecter
router.post("/login",  userController.login);

// Requiert auth — on déconnecte un utilisateur connecté
router.post("/logout", requireAuth, userController.logout);

/* ── CITOYEN ROUTES ── */
// Public — inscription citoyenne sans token
router.post("/CreateUser",          userController.createUser);
router.post("/CreateUserWithImage", upload.single("user_image"), userController.createUserWithImage);

/* ── ADMIN ROUTES ── */
// Public — inscription admin via invitationCode
router.post("/CreateUserAdmin", userController.createUserAdmin);

// [FIX] requireAuth ajouté — getAllUsers filtre par req.user.municipalityId
// Sans requireAuth, req.user est undefined et la route retourne 403
router.get("/GetAllUsers",
  requireAuth,
  userController.getAllUsers
);

// [FIX] requireAuth ajouté — getUserById scoped à municipalityId
router.get("/GetUserById/:id",
  requireAuth,
  userController.getUserById
);

// [FIX] requireAuth ajouté — updateUser scoped à municipalityId
router.put("/UpdateUser/:id",
  requireAuth,
  userController.updateUser
);

// [FIX] requireAuth ajouté — changePassword scoped à municipalityId
router.put("/ChangePassword/:id",
  requireAuth,
  userController.changePassword
);

// requireAuth était déjà là ✅
router.put("/ToggleBlock/:id",
  requireAuth,
  userController.toggleBlock
);

// [FIX] requireAuth ajouté — deleteUser scoped à municipalityId
router.delete("/DeleteUser/:id",
  requireAuth,
  userController.deleteUser
);

/* ── AGENT MUNICIPAL ROUTES ── */
// Public — inscription agent via invitationCode
router.post("/CreateAgent", userController.createUserAgentMunicipal);

/**
 * [FIX] GetAllAgents — était non protégé et sans filtre municipalityId
 * Retournait TOUS les agents de TOUTES les municipalités
 * Maintenant : requireAuth + filtre strict par municipalityId
 */
router.get("/GetAllAgents", requireAuth, async (req, res) => {
  try {
    // Hard block — jamais de fallback find({})
    if (!req.user?.municipalityId) {
      return res.status(403).json({
        message: "Accès refusé : municipalité non définie",
      });
    }

    console.log("[AGENTS] Fetching agents for municipality:", req.user.municipalityId);

    const agents = await User.find({
      role:           "AGENT_MUNICIPAL",
      municipalityId: req.user.municipalityId,   // [FIX] filtre ajouté
    }).select("-motDePasse");

    res.status(200).json({ data: agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * [FIX] GetAgentById — était non protégé et sans filtre municipalityId
 * Un admin pouvait récupérer un agent d'une autre municipalité par son ID
 * Maintenant : requireAuth + findOne({_id, role, municipalityId})
 */
router.get("/GetAgentById/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user?.municipalityId) {
      return res.status(403).json({
        message: "Accès refusé : municipalité non définie",
      });
    }

    const agent = await User.findOne({
      _id:            req.params.id,
      role:           "AGENT_MUNICIPAL",
      municipalityId: req.user.municipalityId,   // [FIX] filtre ajouté
    }).select("-motDePasse");

    if (!agent)
      return res.status(404).json({ message: "Agent Municipal non trouvé" });

    res.status(200).json({ data: agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [FIX] requireAuth ajouté — updateUser scoped à municipalityId
router.put("/UpdateAgent/:id",
  requireAuth,
  userController.updateUser
);

// [FIX] requireAuth ajouté — deleteUser scoped à municipalityId
router.delete("/DeleteAgent/:id",
  requireAuth,
  userController.deleteUser
);

module.exports = router;