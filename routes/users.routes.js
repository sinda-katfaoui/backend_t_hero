const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadfile");
const logMiddleware = require("../middlewares/LogMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(logMiddleware);

/* ── UTILISATEUR ROUTES ── */
router.post("/login",  userController.login);
router.post("/logout", requireAuth, userController.logout);

/* ── CITOYEN ROUTES ── */
router.post("/CreateUser",          userController.createUser);
router.post("/CreateUserWithImage", upload.single("user_image"), userController.createUserWithImage);

/* ── ADMIN ROUTES ── */
router.post("/CreateUserAdmin",       userController.createUserAdmin);
router.get("/GetAllUsers",            userController.getAllUsers);
router.get("/GetUserById/:id",        userController.getUserById);
router.put("/UpdateUser/:id",         userController.updateUser);
router.put("/ChangePassword/:id",     userController.changePassword);
router.put("/ToggleBlock/:id",        requireAuth, userController.toggleBlock); // ✅ NEW
router.delete("/DeleteUser/:id",      userController.deleteUser);

/* ── AGENT MUNICIPAL ROUTES ── */
router.post("/CreateAgent",           userController.createUserAgentMunicipal);

router.get("/GetAllAgents", async (req, res) => {
  try {
    const agents = await User.find({ role: "AGENT_MUNICIPAL" }).select("-motDePasse");
    res.status(200).json({ data: agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/GetAgentById/:id", async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: "AGENT_MUNICIPAL"
    }).select("-motDePasse");
    if (!agent) return res.status(404).json({ message: "Agent Municipal non trouvé" });
    res.status(200).json({ data: agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/UpdateAgent/:id",    userController.updateUser);
router.delete("/DeleteAgent/:id", userController.deleteUser);

module.exports = router;