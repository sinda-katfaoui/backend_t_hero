/**
 * ============================================================
 * FICHIER  : signalements.routes.js
 * RÔLE     : Définition de toutes les routes liées aux signalements
 * RESPONSABILITÉ : Mapper chaque URL HTTP vers le contrôleur signalement
 * PLACE    : Couche "routes/" — reçoit les requêtes et les redirige
 *            vers signalement.controller.js
 * FONCTIONNALITÉ : Gestion complète du cycle de vie d'un signalement :
 *                  création, consultation, traitement, changement de statut
 *                  et suppression — avec authentification et upload de photo
 * ============================================================
 */

const express    = require('express');
const router     = express.Router();
const upload     = require('../middlewares/uploadfile');
const logMiddleware            = require('../middlewares/LogMiddleware');
const { requireAuth }          = require('../middlewares/authMiddleware');
const signalementController    = require('../controllers/signalement.controller');

// Applique le middleware de journalisation sur toutes les routes de ce fichier
router.use(logMiddleware);

/* ── Citoyen: creerSignalement() ── */

/**
 * Création d'un nouveau signalement par un citoyen
 * - requireAuth  : l'utilisateur doit être connecté (token JWT valide)
 * - upload.single : accepte une seule photo jointe au signalement (champ "photo")
 */
router.post('/CreateSignalement',
  requireAuth,
  upload.single('photo'),
  signalementController.createSignalement
);

/* ── consulterSignalements() ── */

// Récupération de tous les signalements (accessible sans authentification)
router.get('/GetAllSignalements',              signalementController.getAllSignalements);

// Récupération d'un signalement précis par son identifiant MongoDB
router.get('/GetSignalementById/:id',          signalementController.getSignalementById);

// Récupération de tous les signalements soumis par un citoyen spécifique
router.get('/GetSignalementsByCitoyen/:citoyenId', signalementController.getSignalementsByCitoyen);

/* ── AgentMunicipal: traiterSignalement() ── */

/**
 * Traitement d'un signalement par un agent municipal
 * - requireAuth : réservé aux utilisateurs authentifiés (agents municipaux)
 */
router.put('/TraiterSignalement/:id',
  requireAuth,
  signalementController.traiterSignalement
);

/* ── AgentMunicipal: changerStatutSignalement() ── */

/**
 * Changement du statut d'un signalement (ex: EN_ATTENTE → EN_COURS → RÉSOLU)
 * - requireAuth : action réservée aux utilisateurs authentifiés
 */
router.put('/ChangerStatut/:id',
  requireAuth,
  signalementController.changerStatutSignalement
);

/* ── Delete ── */

/**
 * Suppression définitive d'un signalement
 * - requireAuth : seul un utilisateur authentifié peut supprimer un signalement
 */
router.delete('/DeleteSignalement/:id',
  requireAuth,
  signalementController.deleteSignalement
);

// Exporte le routeur pour être monté dans app.js
module.exports = router;