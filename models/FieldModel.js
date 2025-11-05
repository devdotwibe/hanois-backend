const pool = require("../db/pool");

class FieldModel {

  static async create(data) {
    const { section_id, key, type } = data;

    const existing = await this.findBySectionAndKey(section_id, key);
    if (existing) return existing;

    const result = await pool.query(
      `INSERT INTO fields (section_id, key, type, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, section_id, key, type, created_at, updated_at`,
      [section_id, key, type]
    );

    return result.rows[0];
  }

  static async findBySectionAndKey(section_id, key) {
    const result = await pool.query(
      "SELECT * FROM fields WHERE section_id = $1 AND key = $2",
      [section_id, key]
    );
    return result.rows[0];
  }
}

module.exports = FieldModel;
