const express = require('express');
const router = express.Router();

// ================= MULTER FOR PROPOSAL UPLOAD =================
const multer = require("multer");
const path = require("path");

const proposalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/proposals"));
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
  updateProposal,
  deleteProposalAttachment
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
  uploadProposal.array("attachments"),
  createProposal
);

router.get(
  "/view-proposal/:id",
  authenticateToken,
  getProposalById
);

router.post(
  "/update-proposal/:id",
  authenticateToken,
  uploadProposal.array("attachments"),
  updateProposal
);

// DELETE ATTACHMENT (must be BEFORE wildcard)
router.delete(
  "/delete-proposal-attachment/:id",
  authenticateToken,
  deleteProposalAttachment
);

// ========================= PROFILE =========================
router.put('/update-profile/:providerId', authenticateToken, updateProviderProfile);

// ========================= CRUD =========================
router.put('/:id', authenticateToken, updateProvider);
router.delete('/:id', authenticateToken, deleteProvider);

// ========================= SINGLE PROVIDER (MUST BE LAST) =========================
router.get('/:id', authenticateToken, getProviderById);

module.exports = router;
