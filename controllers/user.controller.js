const User = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    const hashed = await bcrypt.hash(req.body.motDePasse, 10);
    const user = await User.create({
        ...req.body,
        motDePasse: hashed
    });
    res.status(201).json(user);
};

exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
};

exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
};