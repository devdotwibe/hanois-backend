const SectionModel = require("../models/SectionModel");
const FieldModel = require("../models/FieldModel");
const FieldTranslationModel = require("../models/FieldTranslationModel");
const { successResponse } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

exports.createPage = async (req, res, next) => {
  try {
    const { sectionKey, titles, content } = req.body;

    if (
      !sectionKey ||
      !titles?.en ||
      !titles?.ar ||
      !content?.en ||
      !content?.ar
    ) {
      throw new ValidationError("All English and Arabic title/content fields are required");
    }

    let section = await SectionModel.findByKey(sectionKey);
    if (!section) {
      section = await SectionModel.create({ key: sectionKey });
    }

    let titleField = await FieldModel.findBySectionAndKey(section.id, "title");
    if (!titleField) {
      titleField = await FieldModel.create({ section_id: section.id, key: "title", type: "text" });
    }

    await FieldTranslationModel.upsert(titleField.id, "en", titles.en);
    await FieldTranslationModel.upsert(titleField.id, "ar", titles.ar);

    let contentField = await FieldModel.findBySectionAndKey(section.id, "content");
    if (!contentField) {
      contentField = await FieldModel.create({ section_id: section.id, key: "content", type: "text" });
    }

    await FieldTranslationModel.upsert(contentField.id, "en", content.en);
    await FieldTranslationModel.upsert(contentField.id, "ar", content.ar);

    successResponse(res, { sectionKey, titles, content }, "Page saved successfully", 201);
  } catch (err) {
    next(err);
  }
};
