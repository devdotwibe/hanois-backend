const BannerModel = require("../models/BannerModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create or Update (smart upsert)
exports.createBanner = async (req, res, next) => {
  try {
    const {
      engtitle,
      arabtitle,
      engdescription,
      arabdescription,
    } = req.body;

    if (
      !engtitle ||
      !engdescription ||
      !arabtitle ||
      !arabdescription 
    ) {
      throw new ValidationError("All English and Arabic banner fields are required");
    }

    // 🟩 Ensure home_banner post exists
    let post = await PostModel.findByName("home_banner");
    if (!post) {
      post = await PostModel.create({ name: "home_banner" });
    }

    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, {
        engtitle,
        engdescription,
        arabtitle,
        arabdescription,
      });
    } else {
      banner_en = await BannerModel.create({
        engtitle,
        engdescription,
        arabtitle,
        arabdescription,
        language: "en",
        post_id: post.id,
      });
    }

    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, {
        engtitle: engtitle_ar,
        engdescription: engdescription_ar,
        arabtitle: arabtitle_ar,
        arabdescription: arabdescription_ar,
      });
    } else {
      banner_ar = await BannerModel.create({
        engtitle: engtitle_ar,
        engdescription: engdescription_ar,
        arabtitle: arabtitle_ar,
        arabdescription: arabdescription_ar,
        language: "ar",
        post_id: post.id,
      });
    }

    successResponse(res, { banner_en, banner_ar }, "Banners created or updated successfully", 201);
  } catch (err) {
    next(err);
  }
};

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
    if (!banner) throw new NotFoundError("Banner not found");
    successResponse(res, { banner }, "Banner retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Update banner by ID (generic)
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await BannerModel.updateById(id, req.body);
    if (!banner) throw new NotFoundError("No banner found to update");
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
    if (!deleted) throw new NotFoundError("Banner not found or already deleted");
    successResponse(res, { id: deleted.id }, "Banner deleted successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Update the “home_banner” (used by /update-single)
exports.updateSingleBanner = async (req, res, next) => {
  try {
    const {
      engtitle,
      engdescription,
      arabtitle,
      arabdescription,
      engtitle_ar,
      engdescription_ar,
      arabtitle_ar,
      arabdescription_ar,
    } = req.body;

    // 🟩 Ensure home_banner post exists
    let post = await PostModel.findByName("home_banner");
    if (!post) {
      post = await PostModel.create({ name: "home_banner" });
    }

    // 🟩 English banner
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, {
        engtitle,
        engdescription,
        arabtitle,
        arabdescription,
      });
    } else {
      banner_en = await BannerModel.create({
        engtitle,
        engdescription,
        arabtitle,
        arabdescription,
        language: "en",
        post_id: post.id,
      });
    }

    // 🟩 Arabic banner
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, {
        engtitle: engtitle_ar,
        engdescription: engdescription_ar,
        arabtitle: arabtitle_ar,
        arabdescription: arabdescription_ar,
      });
    } else {
      banner_ar = await BannerModel.create({
        engtitle: engtitle_ar,
        engdescription: engdescription_ar,
        arabtitle: arabtitle_ar,
        arabdescription: arabdescription_ar,
        language: "ar",
        post_id: post.id,
      });
    }

    successResponse(res, { banner_en, banner_ar }, "Banners updated successfully", 200);
  } catch (err) {
    next(err);
  }
};
