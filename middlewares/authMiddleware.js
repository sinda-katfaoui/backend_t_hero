const jwt       = require("jsonwebtoken");
const userModel = require("../models/user.model");

const SECRET_KEY = process.env.JWT_SECRET || "mySecretKey";

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      const user = await userModel.findById(decodedToken.id).select("-motDePasse");

      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      if (user.isBlocked) {
        return res.status(403).json({ error: "Forbidden: Account is blocked" });
      }

      // [FIX] Always expose a clean, minimal object — never the raw Mongoose doc
      // This guarantees controllers always receive consistent, predictable shape
      req.user = {
        id:             user._id,
        role:           user.role,
        municipalityId: user.municipalityId || null,
      };

      // [FIX] Block admin/agent requests that have no municipalityId at login time
      // Citizens are excluded — they access their own data via citoyenId param
      const restrictedRoles = ["ADMIN", "AGENT_MUNICIPAL"];
      if (restrictedRoles.includes(req.user.role) && !req.user.municipalityId) {
        return res.status(403).json({
          error: "Forbidden: Account has no municipality assigned. Contact your administrator.",
        });
      }

      console.log(`[AUTH] User ${req.user.id} | Role: ${req.user.role} | Municipality: ${req.user.municipalityId}`);

      next();
    });

  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { requireAuth };