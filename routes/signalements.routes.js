const express                 = require('express');
const router                  = express.Router();
const upload                  = require('../middlewares/uploadfile');
const logMiddleware           = require('../middlewares/LogMiddleware');
const { requireAuth }         = require('../middlewares/authMiddleware');
const { validateSignalement } = require('../middlewares/validateSignalement');
const signalementController   = require('../controllers/signalement.controller');

router.use(logMiddleware);

router.post('/CreateSignalement',
  requireAuth,
  upload.single('photo'),
  validateSignalement,
  signalementController.createSignalement
);

router.get('/GetAllSignalements',
  requireAuth,
  signalementController.getAllSignalements
);

router.get('/GetSignalementById/:id',
  requireAuth,
  signalementController.getSignalementById
);

router.get('/GetSignalementsByCitoyen/:citoyenId',
  requireAuth,
  signalementController.getSignalementsByCitoyen
);

router.put('/TraiterSignalement/:id',
  requireAuth,
  signalementController.traiterSignalement
);

// [ADDED] upload.single('photoResolution') — agent uploads resolution photo
router.put('/ChangerStatut/:id',
  requireAuth,
  upload.single('photoResolution'),
  signalementController.changerStatutSignalement
);

router.delete('/DeleteSignalement/:id',
  requireAuth,
  signalementController.deleteSignalement
);

module.exports = router;