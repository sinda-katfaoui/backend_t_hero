const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "mySecretKey";
const TOKEN_EXPIRY = "3d";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
};

/* ── login() ── */
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
module.exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUser() ── */
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

    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Citoyen créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserWithImage() ── */
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

    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Citoyen créé avec image", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserAdmin() ── */
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

    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Admin créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── createUserAgentMunicipal() ── */
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

    const { motDePasse: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: "Agent Municipal créé avec succès", data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getAllUsers() ── */
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse");
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getUserById() ── */
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
module.exports.updateUser = async (req, res) => {
  try {
    const { motDePasse, role, ...allowedUpdates } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true }
    ).select("-motDePasse");

    res.status(200).json({ message: "Utilisateur mis à jour", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── changePassword() ── */
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
module.exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.role === 'ADMIN')
      return res.status(403).json({ message: "Impossible de bloquer un admin" });

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