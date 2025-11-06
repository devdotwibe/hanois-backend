const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  updateBannerExtras,   // 🟩 Tab 2 (subtitle, subheading, buttonname)
  getBannerExtras,       // 🟩 Fetch extras (Tab 2)
  updateBannerSubExtras, // 🟩 Tab 3 (subdescription, subbuttonname)
  getBannerSubExtras,    // 🟩 Fetch sub extras (Tab 3)
} = require("../controllers/bannerController");

/* ======================================================
   🟩 ROUTE ORDER IS IMPORTANT IN EXPRESS
   ====================================================== */

// Multer storage config to save files in public/banner folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/banner"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

/* ================================
   TAB 2 — Banner Extras (subtitle, subheading, buttonname)
   ================================ */
router.get("/extras", getBannerExtras);            // Fetch extras for Tab 2
router.put("/update-extras", updateBannerExtras);  // Update extras for Tab 2

/* ================================
   TAB 3 — Banner Sub Extras (subdescription, subbuttonname)
   ================================ */
router.get("/subextras", getBannerSubExtras);           // Fetch sub extras for Tab 3
router.put("/update-subextras", updateBannerSubExtras); // Update sub extras for Tab 3

/* ================================
   TAB 1 — Main Banner (title, description, images, headings)
   ================================ */

// Create new banner (Tab 1)
router.post("/", createBanner);
// List all banners
router.get("/", getBanners);
// Update main banner (Tab 1) with file upload middleware
router.put(
  "/update-single",
  upload.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
  ]),
  updateSingleBanner
);

/* ================================
   ID-BASED ROUTES (must be last)
   ================================ */
router.get("/:id", getBannerById);                // Get banner by ID
router.put("/:id", updateBanner);                 // Update by ID
router.delete("/:id", deleteBanner);              // Delete by ID

module.exports = router;
