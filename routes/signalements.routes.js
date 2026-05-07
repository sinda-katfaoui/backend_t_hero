const express               = require('express');
const router                = express.Router();
const upload                = require('../middlewares/uploadfile');
const logMiddleware         = require('../middlewares/LogMiddleware');
const { requireAuth }       = require('../middlewares/authMiddleware');
const { validateSignalement } = require('../middlewares/validateSignalement');
const signalementController = require('../controllers/signalement.controller');

router.use(logMiddleware);

/**
 * Pipeline CreateSignalement :
 * requireAuth → upload.single (multer) → validateSignalement → controller
 *
 * ORDER MATTERS:
 * - upload must run before validateSignalement so req.file is available
 * - validateSignalement runs before controller so invalid data never reaches DB
 */
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

router.put('/ChangerStatut/:id',
  requireAuth,
  signalementController.changerStatutSignalement
);

router.delete('/DeleteSignalement/:id',
  requireAuth,
  signalementController.deleteSignalement
);

module.exports = router;