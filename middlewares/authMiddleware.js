/**
 * @file authMiddleware.js
 * @description Middleware d'authentification par token JWT.
 * @responsibility Protéger les routes privées de l'API en vérifiant la validité
 *                 du token JWT fourni dans l'en-tête Authorization de chaque requête.
 * @architecture Situé dans le dossier middlewares/, il est injecté dans les routes
 *               qui nécessitent une authentification, avant l'appel au controller.
 * @fonctionnalité Extraction et vérification du token JWT, récupération de l'utilisateur
 *                 en base de données, contrôle du statut du compte (bloqué ou non).
 */

const jwt       = require("jsonwebtoken");
const userModel = require("../models/user.model");

/* Clé secrète utilisée pour signer et vérifier les tokens JWT.
   Récupérée depuis les variables d'environnement — valeur par défaut uniquement en développement. */
const SECRET_KEY = process.env.JWT_SECRET || "mySecretKey";

/**
 * Middleware requireAuth — Vérifie que la requête provient d'un utilisateur authentifié.
 *
 * Étapes de vérification :
 *  1. Lecture du token depuis l'en-tête HTTP "Authorization".
 *  2. Vérification cryptographique du token avec la clé secrète.
 *  3. Récupération de l'utilisateur correspondant en base de données.
 *  4. Contrôle du statut du compte (bloqué ou actif).
 *  5. Injection de l'utilisateur dans req.user pour les controllers suivants.
 *
 * @param {Object} req  - Objet requête Express (doit contenir l'en-tête Authorization)
 * @param {Object} res  - Objet réponse Express
 * @param {Function} next - Fonction de passage au middleware ou controller suivant
 */
const requireAuth = async (req, res, next) => {
  try {
    /* ── Étape 1 : Extraction du token depuis l'en-tête Authorization ── */
    const authHeader = req.headers.authorization;

    /* Vérifie que l'en-tête existe et respecte le format attendu "Bearer <token>" */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    /* Extraction de la valeur du token en supprimant le préfixe "Bearer " */
    const token = authHeader.split(" ")[1];

    /* ── Étape 2 : Vérification cryptographique du token JWT ── */
    jwt.verify(token, SECRET_KEY, async (err, decodedToken) => {

      /* Token invalide, expiré ou falsifié — accès refusé */
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      /* ── Étape 3 : Récupération de l'utilisateur en base de données ──
         Le mot de passe est exclu de la réponse via .select("-motDePasse") pour des raisons de sécurité */
      const user = await userModel.findById(decodedToken.id).select("-motDePasse");

      /* L'utilisateur associé au token n'existe plus en base de données */
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      /* ── Étape 4 : Contrôle du statut du compte ──
         Un compte bloqué par un administrateur ne peut plus accéder à l'API */
      if (user.isBlocked) {
        return res.status(403).json({ error: "Forbidden: Account is blocked" });
      }

      /* ── Étape 5 : Injection de l'utilisateur dans la requête ──
         req.user sera accessible dans tous les controllers des routes protégées */
      req.user = user;
      next();
    });

  } catch (err) {
    /* Capture de toute erreur inattendue durant le processus d'authentification */
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { requireAuth };