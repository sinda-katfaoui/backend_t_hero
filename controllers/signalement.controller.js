/**
 * ============================================================
 * FICHIER  : signalement.controller.js
 * RÔLE     : Logique métier complète de la gestion des signalements
 * RESPONSABILITÉ : Traiter les requêtes HTTP et interagir avec
 *                  les modèles Signalement et Notification
 * PLACE    : Couche "controllers/" — entre les routes et les modèles
 * FONCTIONNALITÉ : Création, consultation, traitement et suivi des
 *                  signalements citoyens avec génération automatique
 *                  de notifications à chaque changement de statut
 * ============================================================
 */

const Signalement  = require('../models/signalement.model');
const Notification = require('../models/notification.model');

/**
 * Création d'un nouveau signalement par un citoyen
 * - Vérifie la présence des champs obligatoires (description, localisation, citoyen)
 * - Sauvegarde la photo si elle est fournie via le middleware uploadfile
 * - Le statut initial est automatiquement défini par le modèle (EN_ATTENTE)
 */
exports.createSignalement = async (req, res) => {
  try {
    const { description, localisation, priorite,
      categorie, citoyen } = req.body;
    if (!description || !localisation || !citoyen) {
      return res.status(400).json({
        message: "description, localisation et citoyen sont requis" });
    }
    const signalement = new Signalement({
      description, localisation, priorite, categorie, citoyen,
      // Sauvegarde le nom du fichier si une photo est uploadée, sinon chaîne vide
      photo: req.file ? req.file.filename : ""
    });
    await signalement.save();
    res.status(201).json({
      message: "Signalement créé avec succès",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupération de tous les signalements avec leurs données liées
 * - Utilise populate() pour résoudre les références MongoDB vers
 *   les collections : citoyen, agent, categorie, analyseIA, notifications
 * - Exclut le mot de passe du citoyen et de l'agent (sécurité)
 */
exports.getAllSignalements = async (req, res) => {
  try {
    const signalements = await Signalement.find()
      .populate('citoyen',   '-motDePasse')
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');
    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupération d'un signalement précis par son identifiant MongoDB
 * - Retourne 404 si le signalement n'existe pas
 * - Peuple toutes les références liées pour une réponse complète
 */
exports.getSignalementById = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id)
      .populate('citoyen',   '-motDePasse')
      .populate('agent',     '-motDePasse')
      .populate('categorie')
      .populate('analyseIA')
      .populate('notifications');
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });
    res.status(200).json({ data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupération de tous les signalements soumis par un citoyen spécifique
 * - Filtre par l'identifiant du citoyen passé en paramètre d'URL
 * - Peuple les références liées sauf le citoyen lui-même (déjà connu)
 */
exports.getSignalementsByCitoyen = async (req, res) => {
  try {
    const signalements = await Signalement.find({
      citoyen: req.params.citoyenId })
      .populate('categorie')
      .populate('agent', '-motDePasse')
      .populate('analyseIA')
      .populate('notifications');
    res.status(200).json({ data: signalements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Prise en charge d'un signalement par un agent municipal
 * - Assigne l'agent au signalement et passe le statut à "EN_COURS"
 * - Génère automatiquement une notification pour informer le citoyen
 * - IMPORTANT : le citoyen est récupéré comme ObjectId brut (sans populate)
 *   pour pouvoir l'utiliser directement comme destinataire de la notification
 */
exports.traiterSignalement = async (req, res) => {
  try {
    const { agent } = req.body;
    if (!agent) return res.status(400).json({
      message: "L'id de l'agent est requis" });

    // ✅ NO populate — keep citoyen as raw ObjectId
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });

    signalement.agent  = agent;
    signalement.statut = 'EN_COURS';
    await signalement.save();

    // Bloc de création de notification — isolé dans un try/catch
    // pour ne pas bloquer la réponse si la notification échoue
    // ✅ citoyen is raw ObjectId — use directly
    try {
      const citoyenId = signalement.citoyen.toString();

      // Tronque la description à 40 caractères pour le message de notification
      const desc = signalement.description.length > 40
        ? signalement.description.substring(0, 40) + '...'
        : signalement.description;

      console.log('Creating notif for citoyen:', citoyenId);

      await new Notification({
        message:      `⚡ Votre signalement "${desc}" est en cours de traitement`,
        type:         'EN_COURS',
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false
      }).save();

      console.log('Notif created successfully');
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({
      message: "Signalement pris en charge",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Changement manuel du statut d'un signalement
 * - Valide que le statut fourni fait partie des valeurs autorisées
 * - Met à jour le statut en base de données
 * - Génère automatiquement une notification personnalisée selon
 *   le nouveau statut : EN_ATTENTE, EN_COURS ou RESOLU
 * - La notification est créée dans un bloc isolé pour ne pas
 *   bloquer la réponse principale en cas d'erreur
 */
exports.changerStatutSignalement = async (req, res) => {
  try {
    const { statut } = req.body;
    const allowedStatuts = ['EN_ATTENTE', 'EN_COURS', 'RESOLU'];

    // Vérifie que le statut fourni est valide avant toute modification
    if (!statut || !allowedStatuts.includes(statut)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs acceptées: ${allowedStatuts.join(', ')}` });
    }

    // ✅ NO populate — keep citoyen as raw ObjectId
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });

    signalement.statut = statut;
    await signalement.save();

    // Bloc de création de notification — isolé pour ne pas bloquer la réponse
    // ✅ citoyen is raw ObjectId — use directly
    try {
      const citoyenId = signalement.citoyen.toString();

      // Tronque la description à 40 caractères pour le message de notification
      const desc = signalement.description.length > 40
        ? signalement.description.substring(0, 40) + '...'
        : signalement.description;

      // Définit le message et le type de notification selon le statut
      let message, type;
      if (statut === 'EN_COURS') {
        message = `⚡ Votre signalement "${desc}" est en cours de traitement`;
        type    = 'EN_COURS';
      } else if (statut === 'RESOLU') {
        message = `✅ Votre signalement "${desc}" a été résolu avec succès !`;
        type    = 'RESOLU';
      } else {
        message = `ℹ️ Votre signalement "${desc}" est en attente`;
        type    = 'EN_ATTENTE';
      }

      console.log('Creating notif for citoyen:', citoyenId);

      await new Notification({
        message,
        type,
        destinataire: citoyenId,
        signalement:  signalement._id,
        lu:           false
      }).save();

      console.log('Notif created successfully');
    } catch (e) {
      console.error('Notif error:', e.message);
    }

    res.status(200).json({
      message: "Statut mis à jour avec succès",
      data: signalement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Suppression définitive d'un signalement par son identifiant
 * - Vérifie l'existence du signalement avant suppression
 * - Retourne 404 si le signalement n'existe pas
 */
exports.deleteSignalement = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({
      message: "Signalement non trouvé" });
    await Signalement.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Signalement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};