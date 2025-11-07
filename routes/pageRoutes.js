const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { createPage, getListed } = require("../controllers/PageController");

/* ======================================================
   🟩 MULTER STORAGE CONFIGURATION
   ====================================================== */

// Store uploaded card images under /public/uploads/cards
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads/cards");
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
   🟩 ROUTES — GET LISTED PAGE
   ====================================================== */

/**
 * @route POST /api/page/save
 * @desc Save "Get Listed" content or cards (with/without images)
 * - If sectionKey === "get_listed" → Saves main section text.
 * - If sectionKey === "get_banner_cards" → Saves cards & images.
 */
router.post(
  "/save",
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.startsWith("multipart/form-data")) {
      upload.any()(req, res, next);
    } else {
      next();
    }
  },
  createPage
);

/**
 * @route GET /api/page/get
 * @desc Get "Get Listed" content or card data
 * @query sectionKey=get_listed|get_banner_cards
 */
router.get("/get", getListed);

module.exports = router;
