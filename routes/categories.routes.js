const express              = require('express');
const router               = express.Router();
const logMiddleware        = require('../middlewares/LogMiddleware');
const { requireAuth }      = require('../middlewares/authMiddleware');
const categorieController  = require('../controllers/categorie.controller');

router.use(logMiddleware);

/* ── Read — public, Flutter needs these to show category list ── */
router.get('/GetAllCategories',                   categorieController.getAllCategories);
router.get('/GetCategorieById/:id',               categorieController.getCategorieById);

/* ── Relation: contient — get signalements inside a category ── */
router.get('/GetSignalementsByCategorie/:id',     categorieController.getSignalementsByCategorie);

/* ── Write — protected, only Admin should manage categories ── */
router.post('/CreateCategorie',
  requireAuth,
  categorieController.createCategorie
);

router.put('/UpdateCategorie/:id',
  requireAuth,
  categorieController.updateCategorie
);

router.delete('/DeleteCategorie/:id',
  requireAuth,
  categorieController.deleteCategorie
);

module.exports = router;