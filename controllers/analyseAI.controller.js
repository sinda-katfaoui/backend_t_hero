const AnalyseAI = require('../models/analyseAI.model');

/* Créer une analyse */
exports.analyserSignalement = async (req, res) => {
    try {
        const analyse = await AnalyseAI.create(req.body);
        res.status(201).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Récupérer analyse par signalement */
exports.getAnalyseBySignalement = async (req, res) => {
    try {
        const { signalementId } = req.params;

        const analyse = await AnalyseAI.findOne({
            signalement: signalementId
        }).populate('signalement');

        if (!analyse) {
            return res.status(404).json({ message: 'Analyse non trouvée' });
        }

        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};