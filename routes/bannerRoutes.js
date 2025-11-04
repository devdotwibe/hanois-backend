const express = require("express");
const router = express.Router();
const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
} = require("../controllers/bannerController");

router.param("id", (req, res, next, id) => {
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format — must be numeric",
    });
  }
  next();
});

router.post("/", createBanner); 
router.get("/", getBanners);   

router.put("/update-single", updateSingleBanner); 

router.get("/:id", getBannerById);    
router.put("/:id", updateBanner);     
router.delete("/:id", deleteBanner); 

module.exports = router;
