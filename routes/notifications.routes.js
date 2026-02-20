var express = require('express');
var router = express.Router();
const notificationController = require('../controllers/notification.controller');

/* NOTIFICATIONS */
router.post('/SendNotification', notificationController.envoyerNotification);

router.get('/GetNotificationsByUser/:userId', notificationController.getNotificationsByUser);

module.exports = router;