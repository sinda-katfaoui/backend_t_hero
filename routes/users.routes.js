var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

/* GET users listing. */
router.get('/GetAllUsers', userController.getAllUsers);


module.exports = router;
