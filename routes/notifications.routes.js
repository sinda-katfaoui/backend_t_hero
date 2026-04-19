const express                = require('express');
const router                 = express.Router();
const logMiddleware          = require('../middlewares/LogMiddleware');
const { requireAuth }        = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notification.controller');

router.use(logMiddleware);

router.post('/SendNotification',
  requireAuth,
  notificationController.envoyerNotification);

router.get('/GetNotificationsByUser/:userId',
  requireAuth,
  notificationController.getNotificationsByUser);

// ✅ Flutter uses this
router.get('/GetNotificationsByCitoyen/:uid',
  requireAuth,
  notificationController.getNotificationsByCitoyen);

router.get('/GetUnreadCount/:userId',
  requireAuth,
  notificationController.getUnreadCount);

router.put('/MarquerCommeLu/:id',
  requireAuth,
  notificationController.marquerCommeLu);

// ✅ Flutter uses this
router.put('/UpdateNotification/:id',
  requireAuth,
  notificationController.updateNotification);

router.put('/MarquerToutesCommeLues/:userId',
  requireAuth,
  notificationController.marquerToutesCommeLues);

router.delete('/DeleteNotification/:id',
  requireAuth,
  notificationController.deleteNotification);

module.exports = router;