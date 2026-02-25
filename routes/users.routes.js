var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

/* USERS */
router.get('/GetAllUsers', userController.getAllUsers);

router.get('/GetUserById/:id', userController.getUserById);

router.post('/CreateUser', userController.createUser);

router.post("/CreateUserAgentMunicipal", userController.createUserAgentMunicipal);



router.put('/UpdateUser/:id', userController.updateUser);

router.delete('/DeleteUser/:id', userController.deleteUser);

module.exports = router;