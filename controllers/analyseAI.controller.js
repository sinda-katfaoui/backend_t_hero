const AnalyseAI = require('../models/analyseAI.model');

exports.analyserSignalement = async (req, res) => {
    const analyse = await AnalyseAI.create(req.body);
    res.status(201).json(analyse);
};