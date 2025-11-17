const express = require("express");
const router = express.Router();

const {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

const { authenticateToken } = require('../middleware/auth');
/* ======================================================
   🟩 FAQ ROUTES
   ====================================================== */

// Create new FAQ or update existing (handles English & Arabic)
router.post("/",authenticateToken, createFaq);

// Get all FAQs
router.get("/",authenticateToken, getFaqs);

// Get single FAQ by ID
router.get("/:id",authenticateToken, getFaqById);

// Update FAQ by ID
router.put("/:id",authenticateToken, updateFaq);

// Delete FAQ by ID
router.delete("/:id",authenticateToken, deleteFaq);

module.exports = router;
