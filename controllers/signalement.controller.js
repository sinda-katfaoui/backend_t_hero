const Signalement = require('../models/signalement.model');

exports.createSignalement = async (req, res) => {
    const signalement = await Signalement.create(req.body);
    res.status(201).json(signalement);
};

exports.getAllSignalements = async (req, res) => {
    const data = await Signalement.find()
        .populate('citoyen')
        .populate('categorie')
        .populate('agent');
    res.json(data);
};

exports.traiterSignalement = async (req, res) => {
    const signalement = await Signalement.findByIdAndUpdate(
        req.params.id,
        {
            statut: req.body.statut,
            agent: req.body.agent
        },
        { new: true }
    );
    res.json(signalement);
};

exports.deleteSignalement = async (req, res) => {
    await Signalement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Signalement supprimé' });
};