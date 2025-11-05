const pool = require("../db/pool");

class SectionModel {

  static async create(data) {
    const { key } = data;

    const existing = await this.findByKey(key);
    if (existing) return existing;

    const result = await pool.query(
      `INSERT INTO sections (key, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING id, key, created_at, updated_at`,
      [key]
    );

    return result.rows[0];
  }

  static async findByKey(key) {
    const result = await pool.query(
      "SELECT * FROM sections WHERE key = $1",
      [key]
    );
    return result.rows[0];
  }
}

module.exports = SectionModel;
