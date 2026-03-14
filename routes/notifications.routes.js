const express                  = require('express');
const router                   = express.Router();
const logMiddleware            = require('../middlewares/LogMiddleware');
const { requireAuth }          = require('../middlewares/authMiddleware');
const notificationController   = require('../controllers/notification.controller');

router.use(logMiddleware);

/* ── envoyerNotification() — from diagram ── */
router.post('/SendNotification',
  requireAuth,
  notificationController.envoyerNotification
);

/* ── Get notifications for a user ── */
router.get('/GetNotificationsByUser/:userId',
  requireAuth,
  notificationController.getNotificationsByUser
);

/* ── Get unread count — for Flutter notification badge ── */
router.get('/GetUnreadCount/:userId',
  requireAuth,
  notificationController.getUnreadCount
);

/* ── marquerCommeLu() — mark one as read ── */
router.put('/MarquerCommeLu/:id',
  requireAuth,
  notificationController.marquerCommeLu
);

/* ── Mark all as read for a user ── */
router.put('/MarquerToutesCommeLues/:userId',
  requireAuth,
  notificationController.marquerToutesCommeLues
);

/* ── Delete notification ── */
router.delete('/DeleteNotification/:id',
  requireAuth,
  notificationController.deleteNotification
);

module.exports = router;