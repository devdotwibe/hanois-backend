const FaqModel = require("../models/FaqModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create FAQ (auto-increment post_name)
exports.createFaq = async (req, res, next) => {
  try {
    const {
      engtitle,
      engquestion,
      enganswer,
      arabtitle,
      arabquestion,
      arabanswer,
    } = req.body;

    // Optional: Validation
    // if (!engquestion || !enganswer || !arabquestion || !arabanswer) {
    //   throw new ValidationError("All FAQ fields are required");
    // }

    // 🟩 Fetch all existing posts to find next faq_content number
    const allPosts = await PostModel.getAll(); // Must exist in PostModel
    const faqPosts = allPosts.filter((p) => p.name.startsWith("faq_content"));

    // 🟩 Determine the next available number (handles missing/deleted posts)
    let nextNumber = 1;
    if (faqPosts.length > 0) {
      const numbers = faqPosts
        .map((p) => parseInt(p.name.replace("faq_content", ""), 10))
        .filter((n) => !isNaN(n));
      nextNumber = Math.max(...numbers) + 1;
    }

    // 🟩 Generate new post name
    const newPostName = `faq_content${nextNumber}`;

    // 🟩 Create a new post record
    const post = await PostModel.create({ name: newPostName });

    // 🟩 Create English FAQ
    const faq_en = await FaqModel.create({
      title: engtitle,
      question: engquestion,
      answer: enganswer,
      language: "en",
      post_name: newPostName,
      post_id: post.id,
    });

    // 🟩 Create Arabic FAQ
    const faq_ar = await FaqModel.create({
      title: arabtitle,
      question: arabquestion,
      answer: arabanswer,
      language: "ar",
      post_name: newPostName,
      post_id: post.id,
    });

    // 🟩 Send success response
    successResponse(
      res,
      { faq_en, faq_ar, post_name: newPostName },
      `FAQ created successfully as ${newPostName}`,
      201
    );
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
