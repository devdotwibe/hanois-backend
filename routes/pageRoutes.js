const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { createPage, getListed } = require("../controllers/PageController");

/* ======================================================
   🟩 MULTER STORAGE CONFIGURATION (Dynamic Folder)
   ====================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Default upload folder
    let uploadDir = path.join(__dirname, "../public/uploads/cards");

    // 🟨 Detect folder based on sectionKey (for Handis)
    const sectionKey = req.body?.sectionKey || req.query?.sectionKey;
    if (sectionKey === "get_listedhandis") {
      uploadDir = path.join(__dirname, "../public/uploads/handis");
    }

    // Ensure the directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize Multer
const upload = multer({ storage });

/* ======================================================
   🟩 ROUTES — GET LISTED PAGE / HANDIS PAGE
   ====================================================== */

/**
 * @route POST /api/page/save
 * @desc Handles:
 * - "get_listed"       → Main text content
 * - "get_banner_cards" → Card images (3 max)
 * - "get_listedhandis" → Handis cards (2 max)
 */
router.post(
  "/save",
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (contentType.startsWith("multipart/form-data")) {
      upload.any()(req, res, next); // parse form + files
    } else {
      next();
    }
  },
  createPage
);

/**
 * @route GET /api/page/get
 * @desc Fetch "get_listed", "get_banner_cards", or "get_listedhandis"
 */
router.get("/get", getListed);

module.exports = router;
