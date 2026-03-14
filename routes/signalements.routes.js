const express    = require('express');
const router     = express.Router();
const upload     = require('../middlewares/uploadfile');
const logMiddleware            = require('../middlewares/LogMiddleware');
const { requireAuth }          = require('../middlewares/authMiddleware');
const signalementController    = require('../controllers/signalement.controller');

router.use(logMiddleware);

/* ── Citoyen: creerSignalement() ── */
router.post('/CreateSignalement',
  requireAuth,
  upload.single('photo'),
  signalementController.createSignalement
);

/* ── consulterSignalements() ── */
router.get('/GetAllSignalements',              signalementController.getAllSignalements);
router.get('/GetSignalementById/:id',          signalementController.getSignalementById);
router.get('/GetSignalementsByCitoyen/:citoyenId', signalementController.getSignalementsByCitoyen);

/* ── AgentMunicipal: traiterSignalement() ── */
router.put('/TraiterSignalement/:id',
  requireAuth,
  signalementController.traiterSignalement
);

/* ── AgentMunicipal: changerStatutSignalement() ── */
router.put('/ChangerStatut/:id',
  requireAuth,
  signalementController.changerStatutSignalement
);

/* ── Delete ── */
router.delete('/DeleteSignalement/:id',
  requireAuth,
  signalementController.deleteSignalement
);

module.exports = router;