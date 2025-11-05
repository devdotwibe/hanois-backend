// routes/faqRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

router.post("/", createFaq);
router.get("/", getFaqs);
router.get("/:id", getFaqById);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);

module.exports = router;
