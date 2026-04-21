const express             = require('express');
const router              = express.Router();
const logMiddleware       = require('../middlewares/LogMiddleware');
const { requireAuth }     = require('../middlewares/authMiddleware');
const analyseAIController = require('../controllers/analyseAI.controller');

router.use(logMiddleware);

/* ── NEW: Direct Base64 image analysis from Flutter ── */
router.post('/analyze',
  requireAuth,
  analyseAIController.analyzeSignalement
);

/* ── analyserTexte() — from diagram ── */
router.post('/AnalyserTexte/:signalementId',
  requireAuth,
  analyseAIController.analyserTexte
);

/* ── analyserImage() — from diagram — now uses Gemini AI ── */
router.post('/AnalyserImage/:signalementId',
  requireAuth,
  analyseAIController.analyserImage
);

/* ── Get analysis by signalement ── */
router.get('/GetAnalyseBySignalement/:signalementId',
  analyseAIController.getAnalyseBySignalement
);

/* ── Get all analyses — Admin dashboard ── */
router.get('/GetAllAnalyses',
  requireAuth,
  analyseAIController.getAllAnalyses
);

/* ── Delete analysis ── */
router.delete('/DeleteAnalyse/:id',
  requireAuth,
  analyseAIController.deleteAnalyse
);

module.exports = router;