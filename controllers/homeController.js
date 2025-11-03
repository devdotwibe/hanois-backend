const BannerModel = require("../models/BannerModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create a new banner
exports.createBanner = async (req, res, next) => {
  try {
    const { engtitle, engdescription, arabtitle, arabdescription } = req.body;

    if (!engtitle || !engdescription || !arabtitle || !arabdescription) {
      throw new ValidationError("All banner fields are required");
    }

    const banner = await BannerModel.create({
      engtitle,
      engdescription,
      arabtitle,
      arabdescription,
    });

    successResponse(res, { banner }, "Banner created successfully", 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all banners
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await BannerModel.getAll();
    successResponse(res, { banners, count: banners.length }, "Banners retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Get single banner by ID
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await BannerModel.findById(id);

    if (!banner) {
      throw new NotFoundError("Banner not found");
    }

    successResponse(res, { banner }, "Banner retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Update banner by ID
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await BannerModel.updateById(id, req.body);

    if (!banner) {
      throw new NotFoundError("Banner not found or not updated");
    }

    successResponse(res, { banner }, "Banner updated successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Delete banner by ID
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await BannerModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundError("Banner not found or already deleted");
    }

    successResponse(res, { id: deleted.id }, "Banner deleted successfully");
  } catch (err) {
    next(err);
  }
};
