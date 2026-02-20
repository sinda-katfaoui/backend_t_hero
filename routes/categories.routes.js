var express = require('express');
var router = express.Router();
const categorieController = require('../controllers/categorie.controller');

/* CATEGORIES */
router.post('/CreateCategorie', categorieController.createCategorie);

router.get('/GetAllCategories', categorieController.getAllCategories);

router.get('/GetCategorieById/:id', categorieController.getCategorieById);

router.put('/UpdateCategorie/:id', categorieController.updateCategorie);

router.delete('/DeleteCategorie/:id', categorieController.deleteCategorie);

module.exports = router;