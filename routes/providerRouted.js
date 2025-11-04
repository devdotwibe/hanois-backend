const express = require('express');
const router = express.Router();

const { registerProvider,resetPassword, getProviders } = require('../controllers/providerController');
const { providerValidation } = require('../middleware/validation');

router.post('/register', providerValidation, registerProvider);


router.post('/reset-password', resetPassword);

router.get('/', getProviders);

module.exports = router;
