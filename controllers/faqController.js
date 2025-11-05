const FaqModel = require("../models/FaqModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create or Update (Smart Upsert)
exports.createFaq = async (req, res, next) => {
  try {
    const { engtitle, engquestion, enganswer, arabtitle, arabquestion, arabanswer } = req.body;

    // Validate required fields
    if (!engtitle || !engquestion || !enganswer || !arabtitle || !arabquestion || !arabanswer) {
      throw new ValidationError("All English and Arabic FAQ fields are required");
    }

    // Find or create the 'faq_content' post
    let post = await PostModel.findByName("faq_content");
    if (!post) {
      post = await PostModel.create({ name: "faq_content" });
    }

    // 🟩 English FAQ
    let faq_en = await FaqModel.findByPostAndLang(post.id, "en");
    const enData = {
      title: engtitle,
      question: engquestion,
      answer: enganswer,
      language: "en",
      post_name: post.name,
      post_id: post.id,
    };

    if (faq_en) {
      faq_en = await FaqModel.updateById(faq_en.id, enData);
    } else {
      faq_en = await FaqModel.create(enData);
    }

    // 🟩 Arabic FAQ
    let faq_ar = await FaqModel.findByPostAndLang(post.id, "ar");
    const arData = {
      title: arabtitle,
      question: arabquestion,
      answer: arabanswer,
      language: "ar",
      post_name: post.name,
      post_id: post.id,
    };

    if (faq_ar) {
      faq_ar = await FaqModel.updateById(faq_ar.id, arData);
    } else {
      faq_ar = await FaqModel.create(arData);
    }

    successResponse(res, { faq_en, faq_ar }, "FAQ created or updated successfully", 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all FAQs
exports.getFaqs = async (req, res, next) => {
  try {
    const faqs = await FaqModel.getAll();
    successResponse(res, { faqs, count: faqs.length }, "FAQs retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Get FAQ by ID
exports.getFaqById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await FaqModel.findById(id);
    if (!faq) throw new NotFoundError("FAQ not found");
    successResponse(res, { faq }, "FAQ retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Update FAQ by ID
exports.updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await FaqModel.updateById(id, req.body);
    if (!faq) throw new NotFoundError("FAQ not found or not updated");
    successResponse(res, { faq }, "FAQ updated successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Delete FAQ by ID
exports.deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await FaqModel.deleteById(id);
    if (!deleted) throw new NotFoundError("FAQ not found or already deleted");
    successResponse(res, { id: deleted.id }, "FAQ deleted successfully");
  } catch (err) {
    next(err);
  }
};
