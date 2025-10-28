// routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Import controller for registration
const { registerUser } = require('../controllers/userController');

// POST request for user registration
router.post('/register', registerUser);

module.exports = router;
