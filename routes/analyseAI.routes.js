/**
 * ============================================================
 * FICHIER  : analyseAI.routes.js
 * RÔLE     : Définition de toutes les routes liées à l'analyse par IA
 * RESPONSABILITÉ : Mapper chaque URL HTTP vers le contrôleur analyseAI
 * PLACE    : Couche "routes/" — reçoit les requêtes et les redirige
 *            vers analyseAI.controller.js
 * FONCTIONNALITÉ : Gestion de l'analyse intelligente des signalements :
 *                  analyse de texte, analyse d'image via Google Vision API,
 *                  analyse directe en Base64 depuis Flutter,
 *                  consultation et suppression des analyses
 * ============================================================
 */

const express             = require('express');
const router              = express.Router();
const logMiddleware       = require('../middlewares/LogMiddleware');
const { requireAuth }     = require('../middlewares/authMiddleware');
const analyseAIController = require('../controllers/analyseAI.controller');

// Applique le middleware de journalisation sur toutes les routes de ce fichier
router.use(logMiddleware);

/* ── NEW: Direct Base64 image analysis from Flutter ── */

/**
 * Analyse directe d'une image envoyée en Base64 depuis l'application Flutter
 * - Permet d'analyser une image sans passer par un signalement existant
 * - requireAuth : réservé aux utilisateurs authentifiés
 */
router.post('/analyze',
  requireAuth,
  analyseAIController.analyzeSignalement
);

/* ── analyserTexte() — from diagram ── */

/**
 * Analyse du texte d'un signalement existant par son identifiant
 * - Extrait et analyse la description textuelle du signalement
 * - requireAuth : réservé aux utilisateurs authentifiés
 */
router.post('/AnalyserTexte/:signalementId',
  requireAuth,
  analyseAIController.analyserTexte
);

/* ── analyserImage() — from diagram — uses Google Vision API ── */

/**
 * Analyse de l'image d'un signalement existant via Google Vision API
 * - Envoie la photo du signalement à Google Vision pour détection et classification
 * - requireAuth : réservé aux utilisateurs authentifiés
 */
router.post('/AnalyserImage/:signalementId',
  requireAuth,
  analyseAIController.analyserImage
);

/* ── Get analysis by signalement ── */

/**
 * Récupération de l'analyse associée à un signalement spécifique
 * - Accessible sans authentification pour consultation publique des résultats
 */
router.get('/GetAnalyseBySignalement/:signalementId',
  analyseAIController.getAnalyseBySignalement
);

/* ── Get all analyses — Admin dashboard ── */

/**
 * Récupération de toutes les analyses disponibles
 * - Réservé au tableau de bord administrateur
 * - requireAuth : accès protégé par token JWT
 */
router.get('/GetAllAnalyses',
  requireAuth,
  analyseAIController.getAllAnalyses
);

/* ── Delete analysis ── */

/**
 * Suppression définitive d'une analyse par son identifiant
 * - requireAuth : seul un utilisateur authentifié peut supprimer une analyse
 */
router.delete('/DeleteAnalyse/:id',
  requireAuth,
  analyseAIController.deleteAnalyse
);

// Exporte le routeur pour être monté dans app.js
module.exports = router;