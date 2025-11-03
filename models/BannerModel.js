const pool = require("../db/pool");

class BannerModel {
  // 🟩 Get all banners
  static async getAll() {
    const result = await pool.query(`
      SELECT id, engtitle, engdescription, arabtitle, arabdescription, created_at, updated_at
      FROM banner
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // 🟩 Create a new banner
  static async create(data) {
    const { engtitle, engdescription, arabtitle, arabdescription } = data;

    const result = await pool.query(
      `INSERT INTO banner (engtitle, engdescription, arabtitle, arabdescription, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, engtitle, engdescription, arabtitle, arabdescription, created_at, updated_at`,
      [engtitle, engdescription, arabtitle, arabdescription]
    );

    return result.rows[0];
  }

  // 🟩 Find banner by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT id, engtitle, engdescription, arabtitle, arabdescription, created_at, updated_at
       FROM banner
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Update banner by ID
  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.engtitle) {
      fields.push(`engtitle = $${paramIndex++}`);
      values.push(data.engtitle);
    }
    if (data.engdescription) {
      fields.push(`engdescription = $${paramIndex++}`);
      values.push(data.engdescription);
    }
    if (data.arabtitle) {
      fields.push(`arabtitle = $${paramIndex++}`);
      values.push(data.arabtitle);
    }
    if (data.arabdescription) {
      fields.push(`arabdescription = $${paramIndex++}`);
      values.push(data.arabdescription);
    }

    if (fields.length === 0) return null;

    // Add updated_at and ID at the end
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE banner SET ${fields.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, engtitle, engdescription, arabtitle, arabdescription, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }

  // 🟩 Delete banner by ID
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM banner WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = BannerModel;
