const express = require('express');
const router = express.Router();
const { registerUser, getUsers, loginUser } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/', authenticateToken, getUsers);

module.exports = router;
