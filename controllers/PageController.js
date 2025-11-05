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



exports.getListed = async (req, res, next) => {
  try {
    const { sectionKey } = req.query;
    if (!sectionKey) {
      throw new ValidationError("sectionKey is required");
    }

    const section = await SectionModel.findByKey(sectionKey);
    if (!section) {
      return successResponse(res, {}, "Section not found");
    }

    const titleField = await FieldModel.findBySectionAndKey(section.id, "title");
    const contentField = await FieldModel.findBySectionAndKey(section.id, "content");

    const title_en = titleField
      ? (await FieldTranslationModel.find(titleField.id, "en"))?.value || ""
      : "";
    const title_ar = titleField
      ? (await FieldTranslationModel.find(titleField.id, "ar"))?.value || ""
      : "";
    const content_en = contentField
      ? (await FieldTranslationModel.find(contentField.id, "en"))?.value || ""
      : "";
    const content_ar = contentField
      ? (await FieldTranslationModel.find(contentField.id, "ar"))?.value || ""
      : "";

    successResponse(
      res,
      { title_en, title_ar, content_en, content_ar },
      "Section fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};
