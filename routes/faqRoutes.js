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

// ✅ Create new FAQ (protected)
router.post("/", authenticateToken, createFaq);

// ✅ Get all FAQs (public)
router.get("/", getFaqs);

// ✅ Get single FAQ by ID (public)
router.get("/:id", getFaqById);

// ✅ Update FAQ by ID (protected)
router.put("/:id", authenticateToken, updateFaq);

// ✅ Delete FAQ by ID (protected)
router.delete("/:id", authenticateToken, deleteFaq);

module.exports = router;
