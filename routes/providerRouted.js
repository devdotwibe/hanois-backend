const express = require('express');
const router = express.Router();

const { registerProvider,
    resetPassword, 
    getProviders,
    deleteProvider,
    updateProvider,
    getProviderById
} = require('../controllers/providerController');
const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', providerValidation, registerProvider);


router.post('/reset-password', resetPassword);

router.get('/', getProviders);

router.delete('/:id', authenticateToken, deleteProvider);

router.put('/:id', authenticateToken, updateProvider);

router.get('/:id', authenticateToken, getProviderById);

module.exports = router;
