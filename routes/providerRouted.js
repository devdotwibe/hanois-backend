// routes/providerRouted.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const {
  registerProvider,
  resetPassword,
  getProviders,
  deleteProvider,
  updateProvider,
  getProviderById,
  updateProviderProfile,
  getAllProviderServices,
  // NEW handlers exported from controller:
  uploadProviderImage,
  deleteProviderImage,
  updateProviderHeadline,
} = require('../controllers/providerController');

const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// multer storage (match the same storage config used by controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

router.post('/register', providerValidation, registerProvider);
router.post('/reset-password', resetPassword);

router.get('/all-provider-services', getAllProviderServices);

router.get('/', getProviders);

// keep original combined endpoint if you still use it elsewhere
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);

router.delete('/:id', authenticateToken, deleteProvider);
router.put('/:id', authenticateToken, updateProvider);

router.get('/:id', authenticateToken, getProviderById);

// NEW: image upload (multipart), image delete, headline update
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
