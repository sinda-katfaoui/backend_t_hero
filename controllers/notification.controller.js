/**
 * ============================================================
 * FICHIER  : notification.controller.js
 * RÔLE     : Logique métier complète de la gestion des notifications
 * RESPONSABILITÉ : Traiter les requêtes HTTP et interagir avec
 *                  le modèle Notification pour toutes les opérations
 * PLACE    : Couche "controllers/" — entre les routes et les modèles
 * FONCTIONNALITÉ : Envoi, consultation, comptage des non-lues,
 *                  marquage individuel ou global comme lues,
 *                  mise à jour et suppression des notifications
 *                  Utilisé à la fois par le dashboard web et l'app Flutter
 * ============================================================
 */

const Notification = require('../models/notification.model');

/**
 * Envoi manuel d'une nouvelle notification à un utilisateur
 * - Vérifie la présence des champs obligatoires (message, destinataire)
 * - Crée et sauvegarde la notification en base de données
 * - Peut être liée à un signalement spécifique via le champ "signalement"
 */
exports.envoyerNotification = async (req, res) => {
  try {
    const { message, type, destinataire, signalement } = req.body;
    if (!message || !destinataire) {
      return res.status(400).json({
        message: "message et destinataire sont requis" });
    }
    const notif = new Notification({
      message, type, destinataire, signalement });
    await notif.save();
    res.status(201).json({
      message: "Notification envoyée avec succès",
      data: notif });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupération de toutes les notifications d'un utilisateur par son ID
 * - Filtre par destinataire (userId passé en paramètre d'URL)
 * - Peuple les données du destinataire (sans mot de passe) et du signalement lié
 * - Trie par date de création décroissante (les plus récentes en premier)
 */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const notifs = await Notification.find({
      destinataire: req.params.userId })
      .populate('destinataire', '-motDePasse')
      .populate({
        path:   'signalement',
        // Sélectionne uniquement les champs utiles du signalement lié
        select: 'description statut priorite localisation'
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ data: notifs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupération des notifications d'un citoyen par son UID
 * - Utilisé spécifiquement par l'application Flutter (paramètre :uid)
 * - Même logique que getNotificationsByUser mais adapté au format Flutter
 * - Trie par date de création décroissante (les plus récentes en premier)
 */
// ✅ Flutter uses this exact route
exports.getNotificationsByCitoyen = async (req, res) => {
  try {
    const notifs = await Notification.find({
      destinataire: req.params.uid })
      .populate('destinataire', '-motDePasse')
      .populate({
        path:   'signalement',
        // Sélectionne uniquement les champs utiles du signalement lié
        select: 'description statut priorite localisation'
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ data: notifs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Comptage des notifications non lues d'un utilisateur
 * - Filtre par destinataire ET par statut lu = false
 * - Utilisé pour afficher le badge de notification dans l'interface
 */
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

/**
 * Marquage d'une notification spécifique comme lue
 * - Recherche la notification par son identifiant MongoDB
 * - Retourne 404 si la notification n'existe pas
 * - Passe le champ "lu" à true et sauvegarde
 */
exports.marquerCommeLu = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({
      message: "Notification non trouvée" });
    notif.lu = true;
    await notif.save();
    res.status(200).json({
      message: "Notification marquée comme lue",
      data:    notif });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mise à jour flexible d'une notification existante
 * - Utilisé spécifiquement par l'application Flutter
 * - Permet de modifier le statut "lu" et/ou le contenu "message"
 * - Seuls les champs fournis dans la requête sont mis à jour
 */
// ✅ Flutter uses this exact route
exports.updateNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({
      message: "Notification non trouvée" });

    // Met à jour uniquement les champs présents dans le corps de la requête
    if (req.body.lu !== undefined) notif.lu = req.body.lu;
    if (req.body.message) notif.message = req.body.message;
    await notif.save();
    res.status(200).json({
      message: "Notification mise à jour",
      data:    notif });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marquage de toutes les notifications non lues d'un utilisateur comme lues
 * - Utilise updateMany pour une mise à jour groupée en une seule requête MongoDB
 * - Filtre par destinataire ET par statut lu = false pour ne cibler
 *   que les notifications concernées
 */
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    await Notification.updateMany(
      { destinataire: req.params.userId, lu: false },
      { lu: true }
    );
    res.status(200).json({
      message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Suppression définitive d'une notification par son identifiant
 * - Vérifie l'existence de la notification avant suppression
 * - Retourne 404 si la notification n'existe pas
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({
      message: "Notification non trouvée" });
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Notification supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};