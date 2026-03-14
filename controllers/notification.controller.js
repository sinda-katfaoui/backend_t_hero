const Notification = require('../models/notification.model');

/* ── envoyerNotification() — from diagram ── */
exports.envoyerNotification = async (req, res) => {
  try {
    const { message, type, destinataire, signalement } = req.body;

    if (!message || !destinataire) {
      return res.status(400).json({ message: "message et destinataire sont requis" });
    }

    const notif = new Notification({
      message,
      type,
      destinataire,
      signalement
    });

    await notif.save();

    res.status(201).json({
      message: "Notification envoyée avec succès",
      data: notif
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Get all notifications for a user ── */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const notifs = await Notification.find({ destinataire: req.params.userId })
      .populate('destinataire', '-motDePasse')
      .populate({
        path:     'signalement',
        select:   'description statut priorite localisation'
      })
      .sort({ dateEnvoi: -1 }); // newest first — important for Flutter list

    res.status(200).json({ data: notifs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Get unread notifications count — useful for Flutter badge ── */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      destinataire: req.params.userId,
      lu:           false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Mark one notification as read ── */
exports.marquerCommeLu = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    notif.lu = true;
    await notif.save();

    res.status(200).json({
      message: "Notification marquée comme lue",
      data:    notif
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Mark all notifications as read for a user ── */
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    await Notification.updateMany(
      { destinataire: req.params.userId, lu: false },
      { lu: true }
    );

    res.status(200).json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Delete notification ── */
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};