/**
 * ============================================================
 * FICHIER  : signalements.routes.js
 * [FIXED]  : requireAuth ajouté sur TOUTES les routes
 *            Sans ça, req.user est undefined et le filtre
 *            municipalityId ne fonctionne pas
 * ============================================================
 */

const express                  = require('express');
const router                   = express.Router();
const upload                   = require('../middlewares/uploadfile');
const logMiddleware            = require('../middlewares/LogMiddleware');
const { requireAuth }          = require('../middlewares/authMiddleware');
const signalementController    = require('../controllers/signalement.controller');

router.use(logMiddleware);

/* ── Citoyen: createSignalement ── */
// requireAuth était déjà là — municipalityId vient de req.user ✅
router.post('/CreateSignalement',
  requireAuth,
  upload.single('photo'),
  signalementController.createSignalement
);

/* ── GetAllSignalements ── */
// [FIX] requireAuth ajouté — sans ça req.user = undefined
// donc getAllSignalements ne peut pas filtrer par municipalityId
router.get('/GetAllSignalements',
  requireAuth,
  signalementController.getAllSignalements
);

/* ── GetSignalementById ── */
// [FIX] requireAuth ajouté — findOne({_id, municipalityId}) nécessite req.user
router.get('/GetSignalementById/:id',
  requireAuth,
  signalementController.getSignalementById
);

/* ── GetSignalementsByCitoyen ── */
// [FIX] requireAuth ajouté — citoyen doit être authentifié
router.get('/GetSignalementsByCitoyen/:citoyenId',
  requireAuth,
  signalementController.getSignalementsByCitoyen
);

/* ── AgentMunicipal: traiterSignalement ── */
router.put('/TraiterSignalement/:id',
  requireAuth,
  signalementController.traiterSignalement
);

/* ── AgentMunicipal: changerStatut ── */
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