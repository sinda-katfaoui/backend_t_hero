const User = require("../models/user.model");

/* CREATE USER */
module.exports.createUser = async (req, res) => {
  try {
    const { nom, email, tel, location, motDePasse, role } = req.body;

    if (!nom || !email || !tel || !location || !motDePasse || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = new User({
      nom,
      email,
      tel,
      location,
      motDePasse,
      role
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* CREATE USER WITH IMAGE */
module.exports.createUserWithImage = async (req, res) => {
  try {
    const { nom, email, tel, location, motDePasse, role } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const user_image = req.file.filename;

    const newUser = new User({
      nom,
      email,
      tel,
      location,
      motDePasse,
      role,
      user_image
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully with image",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* CREATE ADMIN */
module.exports.createUserAdmin = async (req, res) => {
  try {
    const { nom, email, tel, location, motDePasse, code_Admin } = req.body;

    const newUser = new User({
      nom,
      email,
      tel,
      location,
      motDePasse,
      role: "ADMIN",
      code_Admin
    });

    await newUser.save();

    res.status(201).json({
      message: "Admin created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* CREATE AGENT MUNICIPAL */
module.exports.createUserAgentMunicipal = async (req, res) => {
  try {
    const { nom, email, tel, location, motDePasse, code_Agent } = req.body;

    const newUser = new User({
      nom,
      email,
      tel,
      location,
      motDePasse,
      role: "AGENT_MUNICIPAL",
      code_Agent
    });

    await newUser.save();

    res.status(201).json({
      message: "Agent Municipal created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ALL USERS */
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET USER BY ID */
module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* UPDATE USER */
module.exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE USER */
module.exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const jwt = require("jsonwebtoken");

const maxAge3days = 3 * 24 * 60 * 60; // 3 days in seconds
const maxAge = 1 * 60; // 1 minute in seconds
const secretKey = "mySecretKey"; // Use environment variable or default

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    secretKey,
    { expiresIn: maxAge3days }
  );
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.login(email, password);
    const token = createToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge3days * 1000
    });

    res.status(200).json({
      message: "Login successful",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      maxAge: 1 // 1 millisecond to immediately expire the cookie
    });

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};