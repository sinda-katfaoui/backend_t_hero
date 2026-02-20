var express = require('express');
var router = express.Router();
const signalementController = require('../controllers/signalement.controller');

/* SIGNALEMENTS */
router.post('/CreateSignalement', signalementController.createSignalement);

router.get('/GetAllSignalements', signalementController.getAllSignalements);

router.put('/TraiterSignalement/:id', signalementController.traiterSignalement);

router.delete('/DeleteSignalement/:id', signalementController.deleteSignalement);

module.exports = router;