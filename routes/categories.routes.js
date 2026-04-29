/**
 * ============================================================
 * FICHIER  : categories.routes.js
 * RÔLE     : Définition de toutes les routes liées aux catégories
 * RESPONSABILITÉ : Mapper chaque URL HTTP vers le contrôleur catégorie
 * PLACE    : Couche "routes/" — reçoit les requêtes et les redirige
 *            vers categorie.controller.js
 * FONCTIONNALITÉ : Gestion des catégories de signalements :
 *                  consultation publique (Flutter/mobile),
 *                  et administration protégée (création, modification,
 *                  suppression) réservée aux utilisateurs authentifiés
 * ============================================================
 */

const express              = require('express');
const router               = express.Router();
const logMiddleware        = require('../middlewares/LogMiddleware');
const { requireAuth }      = require('../middlewares/authMiddleware');
const categorieController  = require('../controllers/categorie.controller');

// Applique le middleware de journalisation sur toutes les routes de ce fichier
router.use(logMiddleware);

/* ── Read — public, Flutter needs these to show category list ── */

// Récupération de toutes les catégories — accessible publiquement sans authentification
router.get('/GetAllCategories',                   categorieController.getAllCategories);

// Récupération d'une catégorie précise par son identifiant MongoDB
router.get('/GetCategorieById/:id',               categorieController.getCategorieById);

/* ── Relation: contient — get signalements inside a category ── */

/**
 * Récupération de tous les signalements appartenant à une catégorie donnée
 * Implémente la relation "contient" entre Catégorie et Signalement
 */
router.get('/GetSignalementsByCategorie/:id',     categorieController.getSignalementsByCategorie);

/* ── Write — protected, only Admin should manage categories ── */

/**
 * Création d'une nouvelle catégorie
 * - requireAuth : réservé aux administrateurs authentifiés
 */
router.post('/CreateCategorie',
  requireAuth,
  categorieController.createCategorie
);

/**
 * Mise à jour d'une catégorie existante par son identifiant
 * - requireAuth : réservé aux administrateurs authentifiés
 */
router.put('/UpdateCategorie/:id',
  requireAuth,
  categorieController.updateCategorie
);

/**
 * Suppression définitive d'une catégorie par son identifiant
 * - requireAuth : réservé aux administrateurs authentifiés
 */
router.delete('/DeleteCategorie/:id',
  requireAuth,
  categorieController.deleteCategorie
);

// Exporte le routeur pour être monté dans app.js
module.exports = router;