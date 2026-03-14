const jwt       = require("jsonwebtoken");
const userModel = require("../models/user.model");

const SECRET_KEY = process.env.JWT_SECRET || "mySecretKey";

const requireAuth = async (req, res, next) => {
  try {
    // Read token from Authorization header: "Bearer <token>"
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

      req.user = user;
      next();
    });

  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { requireAuth };