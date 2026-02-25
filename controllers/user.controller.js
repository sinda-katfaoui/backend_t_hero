const User = require("../models/user.model");

/* CREATE USER */
module.exports.createUser = async (req, res) => {
  try {
    const { nom, email, tel, location, motDePasse, role } = req.body;

    if (!nom || !email || !tel || !location || !motDePasse || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const newUser = new User({
      nom,
      email,
      tel,
      location,
      motDePasse, // hashed automatically by model
      role
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

/* CREATE USER WITH IMAGE */
module.exports.createUserWithImage = async (req, res) => {
  try {
    const { name, email, password, tel, location } = req.body;
    const user_image = req.file.filename;

    const newUser = new userModel({
      name,
      email,
      password,
      tel,
      location,
      user_image
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully with image",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }

  /*create user_admin*/
  module.exports.createUserAdmin = async (req, res) => {
  try {
    const { name, email, code_Admin } = req.body;

    const newUser = new userModel({
      name,
      email,
      role: "ADMIN",
      code_Admin
    });

    await newUser.save();

    res.status(201).json({
      message: "Admin created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
};

/*create user_agentmunicipal*/
 module.exports.createUserAgentMunicipal = async (req, res) => {
  try {
    const { name, email, code_Agent } = req.body;

    const newUser = new userModel({
      name,
      email,
      role: "AGENT_MUNICIPAL",
      code_Agent
    });

    await newUser.save();

    res.status(201).json({
      message: "AGENT MUNICIPAL created successfully",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};




/* GET ALL USERS */
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Users retrieved successfully",
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET USER BY ID */
module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User retrieved successfully",
      data: user
    });
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
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE USER */
module.exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};