const express = require('express');
const router = express.Router();

const {
  registerProvider,
  resetPassword,
  getProviders,
  deleteProvider,
  updateProvider,
  getProviderById,
  updateProviderProfile,
  getAllProviderServices
} = require('../controllers/providerController');

const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', providerValidation, registerProvider);
router.post('/reset-password', resetPassword);

router.get('/all-provider-services', getAllProviderServices);

router.get('/', getProviders);
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);

router.delete('/:id', authenticateToken, deleteProvider);
router.put('/:id', authenticateToken, updateProvider);

router.get('/:id', authenticateToken, getProviderById);


router.put(
  '/update-profile/:providerId/image',
  authenticateToken,
  upload.single('image'),
  uploadProviderImage
);

router.delete(
  '/update-profile/:providerId/image',
  authenticateToken,
  deleteProviderImage
);

router.put(
  '/update-profile/:providerId/headline',
  authenticateToken,
  updateProviderHeadline
);
module.exports = router;
