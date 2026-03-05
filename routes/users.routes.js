var express = require("express");
var router = express.Router();

const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadfile");
const logMiddleware = require("../middlewares/LogMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");
// ✅ Appliquer le middleware de log sur toutes les routes
router.use(logMiddleware);

/* ============================
   USERS ROUTES
============================ */
router.get("/GetAllUsers", userController.getAllUsers);
router.get("/GetUserById/:id", userController.getUserById);

router.post("/CreateUser", userController.createUser);

router.post(
    "/CreateUserWithImage",
    upload.single("user_image"),
    userController.createUserWithImage
);

router.post("/CreateUserAdmin", userController.createUserAdmin);

router.put("/UpdateUser/:id", userController.updateUser);

router.delete("/DeleteUser/:id", userController.deleteUser);

router.post('/login', userController.login);

router.post('/logout',requireAuth, userController.logout);
/* ============================
   AGENT MUNICIPAL ROUTES
============================ */

// Créer un agent municipal
router.post("/CreateAgent", userController.createUserAgentMunicipal);

// Lire tous les agents municipaux
router.get("/GetAllAgents", async (req, res) => {
    try {
        const users = await userController.getAllUsers(req, res);
        const agents = users.data.filter(user => user.role === "AGENT_MUNICIPAL");
        res.status(200).json({ data: agents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lire un agent par ID
router.get("/GetAgentById/:id", async (req, res) => {
    try {
        const user = await userController.getUserById(req, res);
        if (user.data.role !== "AGENT_MUNICIPAL") {
            return res.status(404).json({ message: "Agent Municipal not found" });
        }
        res.status(200).json({ data: user.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour un agent municipal
router.put("/UpdateAgent/:id", userController.updateUser);

// Supprimer un agent municipal
router.delete("/DeleteAgent/:id", userController.deleteUser);

module.exports = router;