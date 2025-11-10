const FaqModel = require("../models/FaqModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create FAQ (multiple entries allowed)
exports.createFaq = async (req, res, next) => {
  try {
    const {
      engtitle,
      engquestion,
      enganswer,
      arabtitle,
      arabquestion,
      arabanswer,
      order, // ✅ added order field
    } = req.body;

    // Optional: Validate required fields
    // if (!engtitle || !engquestion || !enganswer) {
    //   throw new ValidationError("English title, question, and answer are required");
    // }

    // 🟩 Find or create the 'faq_content' post
    let post = await PostModel.findByName("faq_content");
    if (!post) {
      post = await PostModel.create({ name: "faq_content" });
    }

    // 🟩 Always create a NEW English FAQ
    const faq_en = await FaqModel.create({
      title: engtitle,
      question: engquestion,
      answer: enganswer,
      language: "en",
      post_name: post.name,
      post_id: post.id,
      order: order || 0, // ✅ include order
    });

    // 🟩 Always create a NEW Arabic FAQ
    const faq_ar = await FaqModel.create({
      title: arabtitle,
      question: arabquestion,
      answer: arabanswer,
      language: "ar",
      post_name: post.name,
      post_id: post.id,
      order: order || 0, // ✅ include order
    });

    successResponse(res, { faq_en, faq_ar }, "FAQ created successfully", 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all FAQs (sorted by order ASC)
exports.getFaqs = async (req, res, next) => {
  try {
    const faqs = await FaqModel.getAll(); // already sorted by order ASC in model
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

    // Include order field if present in body
    const updatedData = {
      ...req.body,
      ...(req.body.order ? { order: parseInt(req.body.order) } : {}),
    };

    const faq = await FaqModel.updateById(id, updatedData);

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
