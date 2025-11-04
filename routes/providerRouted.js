const express = require('express');
const router = express.Router();

const { registerProvider } = require('../controllers/providerController');
const { providerValidation } = require('../middleware/validation');

router.post('/register', providerValidation, registerProvider);

module.exports = router;
