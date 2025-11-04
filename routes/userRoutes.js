const express = require('express');
const router = express.Router();
const { registerUser, getUsers, login } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, login);
// router.get('/', authenticateToken, getUsers);

router.get('/', getUsers);

module.exports = router;
