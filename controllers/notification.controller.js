const Notification = require('../models/notification.model');

exports.envoyerNotification = async (req, res) => {
    const notif = await Notification.create(req.body);
    res.status(201).json(notif);
};

exports.getNotificationsByUser = async (req, res) => {
    const notifs = await Notification.find({ destinataire: req.params.userId });
    res.json(notifs);
};