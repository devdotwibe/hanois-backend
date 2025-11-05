const pool = require("../db/pool");

class FieldTranslationModel {

  static async upsert(field_id, language, value) {
    const result = await pool.query(
      `INSERT INTO field_translations (field_id, language, value, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (field_id, language)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING id, field_id, language, value, created_at, updated_at`,
      [field_id, language, value]
    );

    return result.rows[0];
  }

  static async find(field_id, language) {
    const result = await pool.query(
      "SELECT * FROM field_translations WHERE field_id = $1 AND language = $2",
      [field_id, language]
    );
    return result.rows[0];
  }
}

module.exports = FieldTranslationModel;
