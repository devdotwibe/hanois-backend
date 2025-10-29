// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, getUsers } = require('../controllers/userController');

router.post('/register', registerUser);
router.get('/', getUsers);
router.post('/login', loginUser);

module.exports = router;
