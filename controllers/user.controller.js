/**
 * ============================================================
 * FICHIER  : user.controller.js
 * RÔLE     : Logique métier complète de la gestion des utilisateurs
 * RESPONSABILITÉ : Traiter les requêtes HTTP et interagir avec
 *                  le modèle User pour toutes les opérations CRUD
 * PLACE    : Couche "controllers/" — entre les routes et les modèles
 * FONCTIONNALITÉ : Authentification JWT, création de comptes par rôle
 *                  (Citoyen, Admin, Agent Municipal), consultation,
 *                  mise à jour, changement de mot de passe,
 *                  blocage/déblocage et suppression d'utilisateurs
 * ============================================================
 */

const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Clé secrète utilisée pour signer les tokens JWT (définie dans .env)
const SECRET_KEY = process.env.JWT_SECRET || "mySecretKey";

// Durée de validité du token JWT : 3 jours
const TOKEN_EXPIRY = "3d";

/**
 * Génère un token JWT signé contenant l'identifiant de l'utilisateur
 * Ce token sera retourné au client pour authentifier les requêtes suivantes
 */
const createToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
};

/* ── login() ── */

/**
 * Authentification d'un utilisateur
 * - Vérifie la présence de l'email et du mot de passe
 * - Délègue la vérification des identifiants au modèle User (User.login)
 * - Génère et retourne un token JWT en cas de succès
 * - Retourne les informations essentielles de l'utilisateur (sans mot de passe)
 */
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });

    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.status(200).json({
      message: "Connexion réussie",
      token,
      data: {
        _id:   user._id,
        nom:   user.nom,
        email: user.email,
        role:  user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ── logout() ── */

/**
 * Déconnexion de l'utilisateur
 * La gestion du token est côté client (suppression du token stocké)
 * Le backend confirme simplement la déconnexion
 */
module.exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUser() ── */

/**
 * Création d'un compte citoyen sans image de profil
 * - Vérifie que tous les champs obligatoires sont présents
 * - Vérifie l'unicité de l'email avant la création
 * - Attribue automatiquement le rôle "CITOYEN"
 * - Exclut le mot de passe de la réponse retournée (sécurité)
 */
module.exports.createUser = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;
    if (!nom || !email || !motDePasse)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email déjà utilisé" });

    const newUser = new User({ nom, email, motDePasse, role: "CITOYEN" });
    await newUser.save();

    // Destructuration pour exclure le mot de passe de la réponse
    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Citoyen créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserWithImage() ── */

/**
 * Création d'un compte citoyen avec image de profil
 * - Vérifie la présence des champs obligatoires et du fichier uploadé
 * - Vérifie l'unicité de l'email avant la création
 * - Sauvegarde le nom du fichier image (géré par le middleware uploadfile)
 * - Exclut le mot de passe de la réponse retournée (sécurité)
 */
module.exports.createUserWithImage = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;
    if (!nom || !email || !motDePasse)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    if (!req.file)
      return res.status(400).json({ message: "Image requise" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email déjà utilisé" });

    const newUser = new User({
      nom, email, motDePasse,
      role: "CITOYEN",
      user_image: req.file.filename
    });
    await newUser.save();

    // Destructuration pour exclure le mot de passe de la réponse
    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Citoyen créé avec image", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserAdmin() ── */

/**
 * Création d'un compte administrateur
 * - Nécessite un code_Admin en plus des champs standards
 * - Attribue automatiquement le rôle "ADMIN"
 * - Vérifie l'unicité de l'email avant la création
 * - Exclut le mot de passe de la réponse retournée (sécurité)
 */
module.exports.createUserAdmin = async (req, res) => {
  try {
    const { nom, email, motDePasse, code_Admin } = req.body;
    if (!nom || !email || !motDePasse || !code_Admin)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email déjà utilisé" });

    const newUser = new User({ nom, email, motDePasse, role: "ADMIN", code_Admin });
    await newUser.save();

    // Destructuration pour exclure le mot de passe de la réponse
    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Admin créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserAgentMunicipal() ── */

/**
 * Création d'un compte agent municipal
 * - Nécessite un code_Agent en plus des champs standards
 * - Attribue automatiquement le rôle "AGENT_MUNICIPAL"
 * - Vérifie l'unicité de l'email avant la création
 * - Exclut le mot de passe de la réponse retournée (sécurité)
 */
module.exports.createUserAgentMunicipal = async (req, res) => {
  try {
    const { nom, email, motDePasse, code_Agent } = req.body;
    if (!nom || !email || !motDePasse || !code_Agent)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email déjà utilisé" });

    const newUser = new User({ nom, email, motDePasse, role: "AGENT_MUNICIPAL", code_Agent });
    await newUser.save();

    // Destructuration pour exclure le mot de passe de la réponse
    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Agent Municipal créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getAllUsers() ── */

/**
 * Récupération de tous les utilisateurs
 * - Exclut le mot de passe de chaque document retourné (sécurité)
 */
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse");
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getUserById() ── */

/**
 * Récupération d'un utilisateur par son identifiant MongoDB
 * - Retourne 404 si l'utilisateur n'existe pas
 * - Exclut le mot de passe de la réponse (sécurité)
 */
module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-motDePasse");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── updateUser() ── */

/**
 * Mise à jour des informations d'un utilisateur
 * - Sécurité : exclut motDePasse et role des champs modifiables
 *   pour éviter toute élévation de privilèges via cette route
 * - Retourne le document mis à jour sans le mot de passe
 */
module.exports.updateUser = async (req, res) => {
  try {
    // Extraction explicite de motDePasse et role pour les bloquer
    const { motDePasse, role, ...allowedUpdates } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true } // Retourne le document après modification
    ).select("-motDePasse");

    res.status(200).json({ message: "Utilisateur mis à jour", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── changePassword() ── */

/**
 * Changement du mot de passe d'un utilisateur
 * - Route dédiée uniquement au changement de mot de passe
 * - Utilise user.save() pour déclencher le hachage automatique
 *   du mot de passe défini dans le modèle User (hook pre-save)
 */
module.exports.changePassword = async (req, res) => {
  try {
    const { motDePasse } = req.body;
    if (!motDePasse)
      return res.status(400).json({ message: "Mot de passe requis" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.motDePasse = motDePasse;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── toggleBlock() ── ✅ NEW */

/**
 * Blocage ou déblocage d'un utilisateur (bascule automatique)
 * - Sécurité : interdit le blocage d'un administrateur
 * - Inverse la valeur de isBlocked à chaque appel (toggle)
 * - Retourne un message adapté selon l'état résultant
 */
module.exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Protection : un administrateur ne peut jamais être bloqué
    if (user.role === 'ADMIN')
      return res.status(403).json({ message: "Impossible de bloquer un admin" });

    // Inversion de l'état de blocage
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: user.isBlocked
        ? "Utilisateur bloqué avec succès"
        : "Utilisateur débloqué avec succès",
      data: { isBlocked: user.isBlocked }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── deleteUser() ── */

/**
 * Suppression définitive d'un utilisateur par son identifiant
 * - Vérifie l'existence de l'utilisateur avant suppression
 * - Retourne 404 si l'utilisateur n'existe pas
 */
module.exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};