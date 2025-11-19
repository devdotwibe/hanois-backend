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
  addLead,
  updateLead,
  getLeadWorkIds,

  // ===== PROPOSAL CONTROLLERS =====
  createProposal,
  // getProviderProposals,
  // getUserProposals

} = require('../controllers/providerController');

const { providerValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');


// ========================= AUTH =========================
router.post('/register', providerValidation, registerProvider);
router.post('/reset-password', resetPassword);


// ========================= PUBLIC =========================
router.get('/', getProviders);
router.get('/all-provider-services', getAllProviderServices);
router.get('/by-category/:categoryId', getProvidersByCategory);


// ========================= LEADS (MUST be before :id) =========================
router.get("/get_leads", authenticateToken, getLeads);
router.post("/add-lead", authenticateToken, addLead);
router.post("/update-lead", authenticateToken, updateLead);
router.get("/lead-work-ids", authenticateToken, getLeadWorkIds);


// ========================= PROPOSALS (MUST be before :id) =========================
router.post("/send-proposal", authenticateToken, createProposal);
// router.get("/my-proposals", authenticateToken, getProviderProposals);
// router.get("/user-proposals", authenticateToken, getUserProposals);


// ========================= PROFILE =========================
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);


// ========================= CRUD =========================
router.put('/:id', authenticateToken, updateProvider);
router.delete('/:id', authenticateToken, deleteProvider);


// ========================= SINGLE PROVIDER (ALWAYS LAST) =========================
router.get('/:id', authenticateToken, getProviderById);


module.exports = router;
