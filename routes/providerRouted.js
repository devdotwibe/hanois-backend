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

// AUTH + REGISTER
router.post('/register', providerValidation, registerProvider);
router.post('/reset-password', resetPassword);

// PUBLIC LISTINGS
router.get('/', getProviders);
router.get('/all-provider-services', getAllProviderServices);
router.get('/by-category/:categoryId', getProvidersByCategory);

// LEADS (IMPORTANT: must be BEFORE :id)
router.get("/get_leads", authenticateToken, getLeads);
router.post("/add-lead", authenticateToken, addLead);

// PROFILE UPDATE
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);

// CRUD (PUT + DELETE)
router.put('/:id', authenticateToken, updateProvider);
router.delete('/:id', authenticateToken, deleteProvider);

// GET SINGLE PROVIDER (MUST BE LAST)
router.get('/:id', authenticateToken, getProviderById);

router.get("/lead-work-ids", authenticateToken, getLeadWorkIds);




module.exports = router;
