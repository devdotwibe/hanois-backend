const express = require("express");
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
router.post("/", createBanner);                   // Create new banner (Tab 1)
router.get("/", getBanners);                      // List all banners
router.put("/update-single", updateSingleBanner); // Update main banner (Tab 1)

/* ================================
   ID-BASED ROUTES (must be last)
   ================================ */
router.get("/:id", getBannerById);                // Get banner by ID
router.put("/:id", updateBanner);                 // Update by ID
router.delete("/:id", deleteBanner);              // Delete by ID

module.exports = router;
