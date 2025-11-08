const FaqModel = require("../models/FaqModel");
const PostModel = require("../models/PostModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

/**
 * 🟩 Create FAQ
 * - Creates an English FAQ (required)
 * - Optionally creates an Arabic FAQ (only if fields are provided)
 */
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

    // ✅ Validate required English fields
    if (!engquestion || !enganswer) {
      throw new ValidationError("English question and answer are required.");
    }

    // ✅ Ensure 'faq_content' post exists
    let post = await PostModel.findByName("faq_content");
    if (!post) {
      post = await PostModel.create({ name: "faq_content" });
    }

    // 🟩 Always create English FAQ
    const faq_en = await FaqModel.create({
      title: engtitle || null,
      question: engquestion || null,
      answer: enganswer || null,
      language: "en",
      post_name: post.name,
      post_id: post.id,
    });

    // 🟨 Create Arabic FAQ only if fields are provided
    let faq_ar = null;
    const hasArabicData =
      arabtitle?.trim() || arabquestion?.trim() || arabanswer?.trim();

    if (hasArabicData) {
      faq_ar = await FaqModel.create({
        title: arabtitle || null,
        question: arabquestion || null,
        answer: arabanswer || null,
        language: "ar",
        post_name: post.name,
        post_id: post.id,
      });
    }

    return successResponse(
      res,
      { faq_en, faq_ar },
      "FAQ created successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * 🟩 Get all FAQs
 */
exports.getFaqs = async (req, res, next) => {
  try {
    // Optional query: ?language=en
    const { language } = req.query;

    let faqs;
    if (language) {
      faqs = await FaqModel.getAllByLanguage(language);
    } else {
      faqs = await FaqModel.getAll();
    }

    successResponse(
      res,
      { faqs, count: faqs.length },
      "FAQs retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * 🟩 Get single FAQ by ID
 */
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

/**
 * 🟩 Update FAQ
 */
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

/**
 * 🟩 Delete FAQ
 */
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
