const express = require("express");
const router = express.Router();

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  updateBannerExtras, // 🟩 New controller for subtitle/subheading/buttonname
  getBannerExtras,    // 🟩 New controller for fetching extras
} = require("../controllers/bannerController");

/* ======================================================
   🟩 ROUTE ORDER IS IMPORTANT IN EXPRESS
   ====================================================== */

// 1️⃣ SPECIAL ROUTES (MUST COME FIRST)
router.get("/extras", getBannerExtras);           // Fetch only subtitle/subheading/button fields
router.put("/update-extras", updateBannerExtras); // Update subtitle/subheading/button fields

// 2️⃣ REGULAR BANNER ROUTES
router.post("/", createBanner);     // Create a new banner
router.get("/", getBanners);        // Get all banners
router.put("/update-single", updateSingleBanner); // Update Tab 1 banner (with images)

// 3️⃣ ID-BASED ROUTES (MUST COME LAST)
router.get("/:id(\\d+)", getBannerById);     // Get banner by numeric ID
router.put("/:id(\\d+)", updateBanner);      // Update banner by numeric ID
router.delete("/:id(\\d+)", deleteBanner);   // Delete banner by numeric ID

// 🟩 (Removed router.param) → using RegExp (\\d+) ensures :id must be numeric automatically

module.exports = router;
