const express = require("express");
const router = express.Router();

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  // updateBannerExtras, 
  // getBannerExtras,
} = require("../controllers/bannerController");

// 2️⃣ REGULAR BANNER ROUTES
router.post("/", createBanner);
router.get("/", getBanners);
router.put("/update-single", updateSingleBanner);

router.get("/:id", getBannerById);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
