const express = require('express');
const router = express.Router();

// ================= MULTER FOR PROPOSAL UPLOAD =================
const multer = require("multer");
const path = require("path");

const proposalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/banner")); // SAME PATH
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const uploadProposal = multer({ storage: proposalStorage });
// ========================================================================

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

  // PROPOSALS
  createProposal,
  getProposalById,
   updateProposal             // <=== IMPORTANT
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

// ========================= LEADS =========================
router.get("/get_leads", authenticateToken, getLeads);
router.post("/add-lead", authenticateToken, addLead);
router.post("/update-lead", authenticateToken, updateLead);
router.get("/lead-work-ids", authenticateToken, getLeadWorkIds);

// ========================= PROPOSALS =========================
router.post(
  "/send-proposal",
  authenticateToken,
  uploadProposal.single("attachment"),
  createProposal
);

// ⭐⭐ NEW ROUTE — View Proposal (must be before :id route)
router.get(
  "/view-proposal/:id",
  authenticateToken,
  getProposalById
);

router.post(
  "/update-proposal/:id",
  authenticateToken,
  uploadProposal.single("attachment"),  // file upload support
  updateProposal
);


// ========================= PROFILE =========================
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);

// ========================= CRUD =========================
router.put('/:id', authenticateToken, updateProvider);
router.delete('/:id', authenticateToken, deleteProvider);

// ========================= SINGLE PROVIDER =========================
router.get('/:id', authenticateToken, getProviderById);

module.exports = router;
