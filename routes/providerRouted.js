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
  getAllProviderServices,
  getProvidersByCategory,
  getLeads,
   addLead 
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

router.get("/get_leads", authenticateToken, getLeads);

router.get('/:id', authenticateToken, getProviderById);

router.get("/by-category/:categoryId", getProvidersByCategory);



router.get("/get_leads", authenticateToken, getLeads);

// ⭐ NEW: ADD TO LEADS
router.post("/add-lead", authenticateToken, addLead);

router.get('/:id', authenticateToken, getProviderById);


module.exports = router;
