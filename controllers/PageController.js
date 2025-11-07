const fs = require("fs");
const path = require("path");
const SectionModel = require("../models/SectionModel");
const FieldModel = require("../models/FieldModel");
const FieldTranslationModel = require("../models/FieldTranslationModel");
const { successResponse } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

exports.createPage = async (req, res, next) => {
  try {
    const { sectionKey } = req.body;

    // 🟩 Base URL for serving images
    const BASE_URL = process.env.BASE_URL || "https://hanois.dotwibe.com/api";

    // Case 1️⃣ — Normal Page (get_listed)
    if (sectionKey === "get_listed") {
      const { titles, content } = req.body;
      if (!titles?.en || !titles?.ar || !content?.en || !content?.ar) {
        throw new ValidationError("All English and Arabic title/content fields are required");
      }

      let section = await SectionModel.findByKey(sectionKey);
      if (!section) section = await SectionModel.create({ key: sectionKey });

      // Title field
      let titleField = await FieldModel.findBySectionAndKey(section.id, "title");
      if (!titleField)
        titleField = await FieldModel.create({ section_id: section.id, key: "title", type: "text" });

      await FieldTranslationModel.upsert(titleField.id, "en", titles.en);
      await FieldTranslationModel.upsert(titleField.id, "ar", titles.ar);

      // Content field
      let contentField = await FieldModel.findBySectionAndKey(section.id, "content");
      if (!contentField)
        contentField = await FieldModel.create({ section_id: section.id, key: "content", type: "text" });

      await FieldTranslationModel.upsert(contentField.id, "en", content.en);
      await FieldTranslationModel.upsert(contentField.id, "ar", content.ar);

      return successResponse(res, { sectionKey, titles, content }, "Page saved successfully", 201);
    }

    // Case 2️⃣ — Cards (get_banner_cards)
    if (sectionKey === "get_banner_cards") {
      const parentSection =
        (await SectionModel.findByKey(sectionKey)) || (await SectionModel.create({ key: sectionKey }));

      const files = req.files || [];
      const body = req.body;

      const cards = [];

      for (let i = 1; i <= 3; i++) {
        const title_en = body[`card_${i}_title_en`];
        const title_ar = body[`card_${i}_title_ar`];
        const content_en = body[`card_${i}_content_en`];
        const content_ar = body[`card_${i}_content_ar`];
        const imageFile = files.find(f => f.fieldname === `card_${i}_image`);

        if (!title_en && !title_ar && !content_en && !content_ar && !imageFile) continue;

        const cardKey = `${sectionKey}_card_${i}`;
        let section =
          (await SectionModel.findByKey(cardKey)) ||
          (await SectionModel.create({ key: cardKey, parent_key: sectionKey }));

        // Title
        let titleField = await FieldModel.findBySectionAndKey(section.id, "title");
        if (!titleField)
          titleField = await FieldModel.create({ section_id: section.id, key: "title", type: "text" });

        await FieldTranslationModel.upsert(titleField.id, "en", title_en || "");
        await FieldTranslationModel.upsert(titleField.id, "ar", title_ar || "");

        // Content
        let contentField = await FieldModel.findBySectionAndKey(section.id, "content");
        if (!contentField)
          contentField = await FieldModel.create({ section_id: section.id, key: "content", type: "text" });

        await FieldTranslationModel.upsert(contentField.id, "en", content_en || "");
        await FieldTranslationModel.upsert(contentField.id, "ar", content_ar || "");

        // Image
        let imageField = await FieldModel.findBySectionAndKey(section.id, "image");
        if (!imageField)
          imageField = await FieldModel.create({ section_id: section.id, key: "image", type: "image" });

        let imagePath = null;
        if (imageFile && imageFile.size > 0) {
          const destDir = path.join(__dirname, "../public/uploads/cards");
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

          const filename = `${Date.now()}-${imageFile.originalname}`;
          const destPath = path.join(destDir, filename);
          fs.renameSync(imageFile.path, destPath);

          imagePath = `${BASE_URL}/uploads/cards/${filename}`;
        }

        await FieldTranslationModel.upsert(imageField.id, "en", imagePath || "");
        await FieldTranslationModel.upsert(imageField.id, "ar", imagePath || "");

        cards.push({
          title_en,
          title_ar,
          content_en,
          content_ar,
          image: imagePath,
        });
      }

      return successResponse(res, { cards }, "Cards saved successfully", 201);
    }

    throw new ValidationError("Invalid sectionKey");
  } catch (err) {
    // Cleanup temp files on failure
    if (req.files?.length) {
      for (const file of req.files) {
        fs.unlink(file.path, () => {});
      }
    }
    next(err);
  }
};

exports.getListed = async (req, res, next) => {
  try {
    const { sectionKey } = req.query;
    if (!sectionKey) throw new ValidationError("sectionKey is required");

    const section = await SectionModel.findByKey(sectionKey);
    if (!section) return successResponse(res, {}, "Section not found");

    if (sectionKey === "get_listed") {
      const titleField = await FieldModel.findBySectionAndKey(section.id, "title");
      const contentField = await FieldModel.findBySectionAndKey(section.id, "content");

      const title_en = titleField ? (await FieldTranslationModel.find(titleField.id, "en"))?.value || "" : "";
      const title_ar = titleField ? (await FieldTranslationModel.find(titleField.id, "ar"))?.value || "" : "";
      const content_en = contentField ? (await FieldTranslationModel.find(contentField.id, "en"))?.value || "" : "";
      const content_ar = contentField ? (await FieldTranslationModel.find(contentField.id, "ar"))?.value || "" : "";

      return successResponse(res, { title_en, title_ar, content_en, content_ar }, "Section fetched successfully");
    }

    if (sectionKey === "get_banner_cards") {
      const cards = [];
      for (let i = 1; i <= 3; i++) {
        const subKey = `${sectionKey}_card_${i}`;
        const subSection = await SectionModel.findByKey(subKey);
        if (!subSection) continue;

        const titleField = await FieldModel.findBySectionAndKey(subSection.id, "title");
        const contentField = await FieldModel.findBySectionAndKey(subSection.id, "content");
        const imageField = await FieldModel.findBySectionAndKey(subSection.id, "image");

        const card = {
          title_en: (await FieldTranslationModel.find(titleField.id, "en"))?.value || "",
          title_ar: (await FieldTranslationModel.find(titleField.id, "ar"))?.value || "",
          content_en: (await FieldTranslationModel.find(contentField.id, "en"))?.value || "",
          content_ar: (await FieldTranslationModel.find(contentField.id, "ar"))?.value || "",
          image: (await FieldTranslationModel.find(imageField.id, "en"))?.value || "",
        };
        cards.push(card);
      }

      return successResponse(res, { cards }, "Cards fetched successfully");
    }

    return successResponse(res, {}, "Section fetched successfully");
  } catch (err) {
    next(err);
  }
};
