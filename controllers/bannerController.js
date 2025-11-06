const BannerModel = require("../models/BannerModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors"); 

// 🟩 Create or Update (Smart Upsert)
exports.createBanner = async (req, res, next) => {
  try {
    const {
      engtitle,
      engdescription,
      arabtitle,
      arabdescription,
      englishheading1,
      englishheading2,
      englishheading3,
      arabicheading1,
      arabicheading2,
      arabicheading3,
      image1,
      image2,
      image3,
    } = req.body;

    // Validate required fields
    if (!engtitle || !engdescription || !arabtitle || !arabdescription) {
      throw new ValidationError("All English and Arabic banner fields are required");
    }

    // Find or create post entry
    let post = await PostModel.findByName("home_banner");
    if (!post) {
      post = await PostModel.create({ name: "home_banner" });
    }

    // 🟩 English banner
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    const enData = {
      title: engtitle,
      description: engdescription,
      heading1: englishheading1,
      heading2: englishheading2,
      heading3: englishheading3,
      image1,
      image2,
      image3,
      language: "en",
      post_name: post.name,
      post_id: post.id,
    };

    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, enData);
    } else {
      banner_en = await BannerModel.create(enData);
    }

    // 🟩 Arabic banner
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    const arData = {
      title: arabtitle,
      description: arabdescription,
      heading1: arabicheading1,
      heading2: arabicheading2,
      heading3: arabicheading3,
      image1,
      image2,
      image3,
      language: "ar",
      post_name: post.name,
      post_id: post.id,
    };

    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, arData);
    } else {
      banner_ar = await BannerModel.create(arData);
    }

    successResponse(
      res,
      { banner_en, banner_ar },
      "Banners created or updated successfully",
      201
    );
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

// 🟩 Update Single Banner (for homepage updates)
exports.updateSingleBanner = async (req, res, next) => {
  try {
   const body = req.body || {};
   
    const {
      engtitle,
      engdescription,
      arabtitle,
      arabdescription,
      englishheading1,
      englishheading2,
      englishheading3,
      arabicheading1,
      arabicheading2,
      arabicheading3,
    } = body;


    // multer files
    const files = req.files || {};

    // Helper to get uploaded file path or fallback to existing URL string
    const getImagePath = (fieldName) => {
      if (files[fieldName]?.[0]) {
        return `/banner/${files[fieldName][0].filename}`; // public URL path
      }
      return req.body[fieldName] || ""; // existing URL from body if no new upload
    };

    // Ensure post exists
    let post = await PostModel.findByName("home_banner");
    if (!post) {
      post = await PostModel.create({ name: "home_banner" });
    }

    // Prepare English banner data
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    const enData = {
      title: engtitle,
      description: engdescription,
      heading1: englishheading1,
      heading2: englishheading2,
      heading3: englishheading3,
      image1: getImagePath("image1"),
      image2: getImagePath("image2"),
      image3: getImagePath("image3"),
      language: "en",
      post_name: post.name,
      post_id: post.id,
    };

    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, enData);
    } else {
      banner_en = await BannerModel.create(enData);
    }

    // Prepare Arabic banner data
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    const arData = {
      title: arabtitle,
      description: arabdescription,
      heading1: arabicheading1,
      heading2: arabicheading2,
      heading3: arabicheading3,
      image1: getImagePath("image1"),
      image2: getImagePath("image2"),
      image3: getImagePath("image3"),
      language: "ar",
      post_name: post.name,
      post_id: post.id,
    };

    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, arData);
    } else {
      banner_ar = await BannerModel.create(arData);
    }

    successResponse(res, { banner_en, banner_ar }, "Banners updated successfully", 200);
  } catch (err) {
    next(err);
  }
};




// 🟩 Update Banner Extras (subtitle, subheading, buttonname)
exports.updateBannerExtras = async (req, res, next) => {
  try {
    const {
      subtitle,
      subheading,
      buttonname,
      arabicsubtitle,
      arabicsubheading,
      arabicbuttonname,
    } = req.body;

    // Find or create "home_banner" post
    let post = await PostModel.findByName("home_banner");
    if (!post) post = await PostModel.create({ name: "home_banner" });

    // 🟩 English Banner
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    const enData = {
      subtitle,
      subheading,
      buttonname,
      language: "en",
      post_id: post.id,
      post_name: post.name,
    };

    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, enData);
    } else {
      banner_en = await BannerModel.create(enData);
    }

    // 🟩 Arabic Banner
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    const arData = {
      subtitle: arabicsubtitle,
      subheading: arabicsubheading,
      buttonname: arabicbuttonname,
      language: "ar",
      post_id: post.id,
      post_name: post.name,
    };

    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, arData);
    } else {
      banner_ar = await BannerModel.create(arData);
    }

    successResponse(res, { banner_en, banner_ar }, "Banner extras updated successfully", 200);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get only Banner Extras (for Tab 2 fetch)
exports.getBannerExtras = async (req, res, next) => {
  try {
    const banners = await BannerModel.getAll();
    const en = banners.find((b) => b.language === "en") || {};
    const ar = banners.find((b) => b.language === "ar") || {};

    const extras = {
      subtitle: en.subtitle || "",
      subheading: en.subheading || "",
      buttonname: en.buttonname || "",
      arabicsubtitle: ar.subtitle || "",
      arabicsubheading: ar.subheading || "",
      arabicbuttonname: ar.buttonname || "",
    };

    successResponse(res, { extras }, "Banner extras fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};











// 🟩 Update Banner Extras (subtitle, subheading, buttonname)
exports.updateBannerExtras = async (req, res, next) => {
  try {
    const {
      subtitle,
      subheading,
      buttonname,
      arabicsubtitle,
      arabicsubheading,
      arabicbuttonname,
    } = req.body;

    // Find or create "home_banner" post
    let post = await PostModel.findByName("home_banner");
    if (!post) post = await PostModel.create({ name: "home_banner" });

    // 🟩 English Banner
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    const enData = {
      subtitle,
      subheading,
      buttonname,
      language: "en",
      post_id: post.id,
      post_name: post.name,
    };

    if (banner_en) {
      banner_en = await BannerModel.updateById(banner_en.id, enData);
    } else {
      banner_en = await BannerModel.create(enData);
    }

    // 🟩 Arabic Banner
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    const arData = {
      subtitle: arabicsubtitle,
      subheading: arabicsubheading,
      buttonname: arabicbuttonname,
      language: "ar",
      post_id: post.id,
      post_name: post.name,
    };

    if (banner_ar) {
      banner_ar = await BannerModel.updateById(banner_ar.id, arData);
    } else {
      banner_ar = await BannerModel.create(arData);
    }

    successResponse(res, { banner_en, banner_ar }, "Banner extras updated successfully", 200);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get only Banner Extras (for Tab 2 fetch)
exports.getBannerExtras = async (req, res, next) => {
  try {
    const banners = await BannerModel.getAll();
    const en = banners.find((b) => b.language === "en") || {};
    const ar = banners.find((b) => b.language === "ar") || {};

    const extras = {
      subtitle: en.subtitle || "",
      subheading: en.subheading || "",
      buttonname: en.buttonname || "",
      arabicsubtitle: ar.subtitle || "",
      arabicsubheading: ar.subheading || "",
      arabicbuttonname: ar.buttonname || "",
    };

    successResponse(res, { extras }, "Banner extras fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};


// 🟩 Update Banner Sub Extras (subdescription, subbuttonname)
exports.updateBannerSubExtras = async (req, res, next) => {
  try {
    const {
      subdescription,
      subbuttonname,
      arabicsubdescription,
      arabicsubbuttonname,
    } = req.body;

    // Find or create the "home_banner" post
    let post = await PostModel.findByName("home_banner");
    if (!post) post = await PostModel.create({ name: "home_banner" });

    // 🟩 English Banner Sub Extras
    let banner_en = await BannerModel.findByPostAndLang(post.id, "en");
    const enData = {
      subdescription,
      subbuttonname,
      language: "en",
      post_id: post.id,
      post_name: post.name,
    };

    banner_en
      ? (banner_en = await BannerModel.updateById(banner_en.id, enData))
      : (banner_en = await BannerModel.create(enData));

    // 🟩 Arabic Banner Sub Extras
    let banner_ar = await BannerModel.findByPostAndLang(post.id, "ar");
    const arData = {
      subdescription: arabicsubdescription,
      subbuttonname: arabicsubbuttonname,
      language: "ar",
      post_id: post.id,
      post_name: post.name,
    };

    banner_ar
      ? (banner_ar = await BannerModel.updateById(banner_ar.id, arData))
      : (banner_ar = await BannerModel.create(arData));

    successResponse(
      res,
      { banner_en, banner_ar },
      "Banner sub extras updated successfully",
      200
    );
  } catch (err) {
    next(err);
  }
};

// 🟩 Get only Banner Sub Extras (for Tab 3 fetch)
exports.getBannerSubExtras = async (req, res, next) => {
  try {
    const banners = await BannerModel.getAll();
    const en = banners.find((b) => b.language === "en") || {};
    const ar = banners.find((b) => b.language === "ar") || {};

    const subExtras = {
      subdescription: en.subdescription || "",
      subbuttonname: en.subbuttonname || "",
      arabicsubdescription: ar.subdescription || "",
      arabicsubbuttonname: ar.subbuttonname || "",
    };

    successResponse(
      res,
      { subExtras },
      "Banner sub extras fetched successfully",
      200
    );
  } catch (err) {
    next(err);
  }
};

