const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token" });
    }

    jwt.verify(token,"mySecretKey", async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      } else {
        const user = await userModel.findById(decodedToken.id);

        if (!user) {
          return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = user; // Attach user to request
        next();
      }
    });

  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized: Invalid token"
    });
  }
};

module.exports = { requireAuth };