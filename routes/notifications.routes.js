/**
 * ============================================================
 * FICHIER  : notifications.routes.js
 * RÔLE     : Définition de toutes les routes liées aux notifications
 * RESPONSABILITÉ : Mapper chaque URL HTTP vers le contrôleur notification
 * PLACE    : Couche "routes/" — reçoit les requêtes et les redirige
 *            vers notification.controller.js
 * FONCTIONNALITÉ : Gestion complète des notifications utilisateur :
 *                  envoi, consultation, comptage des non-lues,
 *                  marquage comme lues et suppression
 *                  Toutes les routes sont protégées par authentification
 * ============================================================
 */

const express                = require('express');
const router                 = express.Router();
const logMiddleware          = require('../middlewares/LogMiddleware');
const { requireAuth }        = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notification.controller');

// Applique le middleware de journalisation sur toutes les routes de ce fichier
router.use(logMiddleware);

/**
 * Envoi d'une nouvelle notification à un utilisateur
 * - requireAuth : seul un utilisateur authentifié peut envoyer une notification
 */
router.post('/SendNotification',
  requireAuth,
  notificationController.envoyerNotification);

/**
 * Récupération de toutes les notifications d'un utilisateur par son ID
 * - requireAuth : un utilisateur ne peut consulter que ses propres notifications
 */
router.get('/GetNotificationsByUser/:userId',
  requireAuth,
  notificationController.getNotificationsByUser);

/**
 * Récupération des notifications d'un citoyen par son UID Firebase
 * - Utilisé par l'application Flutter pour afficher les notifications mobiles
 * - requireAuth : accès protégé par token JWT
 */
// ✅ Flutter uses this
router.get('/GetNotificationsByCitoyen/:uid',
  requireAuth,
  notificationController.getNotificationsByCitoyen);

/**
 * Récupération du nombre de notifications non lues d'un utilisateur
 * - Utile pour afficher le badge de notification dans l'interface
 */
router.get('/GetUnreadCount/:userId',
  requireAuth,
  notificationController.getUnreadCount);

/**
 * Marquage d'une notification spécifique comme lue
 * - requireAuth : action réservée à l'utilisateur authentifié concerné
 */
router.put('/MarquerCommeLu/:id',
  requireAuth,
  notificationController.marquerCommeLu);

/**
 * Mise à jour du contenu d'une notification existante
 * - Utilisé par l'application Flutter pour modifier une notification
 * - requireAuth : accès protégé par token JWT
 */
// ✅ Flutter uses this
router.put('/UpdateNotification/:id',
  requireAuth,
  notificationController.updateNotification);

/**
 * Marquage de toutes les notifications d'un utilisateur comme lues en une seule action
 * - requireAuth : action réservée à l'utilisateur authentifié concerné
 */
router.put('/MarquerToutesCommeLues/:userId',
  requireAuth,
  notificationController.marquerToutesCommeLues);

/**
 * Suppression définitive d'une notification par son identifiant
 * - requireAuth : seul un utilisateur authentifié peut supprimer une notification
 */
router.delete('/DeleteNotification/:id',
  requireAuth,
  notificationController.deleteNotification);

// Exporte le routeur pour être monté dans app.js
module.exports = router;