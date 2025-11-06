const express = require('express');
const router = express.Router();

const { registerProvider,
    resetPassword, 
    getProviders,
    deletePrivider
} = require('../controllers/providerController');
const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', providerValidation, registerProvider);


router.post('/reset-password', resetPassword);

router.get('/', getProviders);

router.delete('/:id', authenticateToken, deletePrivider);

module.exports = router;
