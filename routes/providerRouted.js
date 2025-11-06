const express = require('express');
const router = express.Router();

const { registerProvider,
    resetPassword, 
    getProviders,
    deleteProvider
} = require('../controllers/providerController');
const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', providerValidation, registerProvider);


router.post('/reset-password', resetPassword);

router.get('/', getProviders);

router.delete('/:id', authenticateToken, deleteProvider);

module.exports = router;
