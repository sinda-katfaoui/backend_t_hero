var express = require('express');
var router = express.Router();
const analyseAIController = require('../controllers/analyseAI.controller');

/* ANALYSE IA */
router.post('/AnalyserSignalement', analyseAIController.analyserSignalement);

router.get('/GetAnalyseBySignalement/:signalementId', analyseAIController.getAnalyseBySignalement);

module.exports = router;