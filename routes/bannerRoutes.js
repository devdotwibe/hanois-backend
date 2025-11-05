const express = require("express");
const router = express.Router();

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  updateBannerExtras, // 🟩 Tab 2 (subtitle, subheading, buttonname)
  getBannerExtras,    // 🟩 Fetch extras (used by Tab 2 on load)
} = require("../controllers/bannerController");

/* ======================================================
   🟩 ROUTE ORDER IS IMPORTANT IN EXPRESS
   ====================================================== */

// 1️⃣ SPECIAL ROUTES (must come before :id routes)
router.get("/extras", getBannerExtras);           // Fetch subtitle/subheading/button fields
router.put("/update-extras", updateBannerExtras); // Update subtitle/subheading/button fields

// 2️⃣ REGULAR BANNER ROUTES
router.post("/", createBanner);                   // Create new banner (Tab 1)
router.get("/", getBanners);                      // List all banners
router.put("/update-single", updateSingleBanner); // Update Tab 1 (with images)

// 3️⃣ ID-BASED ROUTES (keep last to avoid conflicts)
router.get("/:id", getBannerById);                // Get banner by ID
router.put("/:id", updateBanner);                 // Update by ID
router.delete("/:id", deleteBanner);              // Delete by ID

module.exports = router;
