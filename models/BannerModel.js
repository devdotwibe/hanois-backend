const pool = require("../db/pool");

class BannerModel {
  // 🟩 Get all banners (including post info and language)
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        b.id, 
        b.engtitle, 
        b.engdescription, 
        b.arabtitle, 
        b.arabdescription, 
        b.language,
        b.post_id,
        p.name AS post_name,
        b.created_at, 
        b.updated_at
      FROM banner b
      LEFT JOIN post p ON b.post_id = p.id
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }

  // 🟩 Create a new banner
  static async create(data) {
    const {
      engtitle,
      engdescription,
      arabtitle,
      arabdescription,
      post_id,
      language = "en",
    } = data;

    const result = await pool.query(
      `INSERT INTO banner (
        engtitle, engdescription, arabtitle, arabdescription, post_id, language, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING 
        id, engtitle, engdescription, arabtitle, arabdescription, post_id, language, created_at, updated_at`,
      [engtitle, engdescription, arabtitle, arabdescription, post_id, language]
    );

    return result.rows[0];
  }

  // 🟩 Find banner by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT 
        b.id, b.engtitle, b.engdescription, b.arabtitle, b.arabdescription, 
        b.language, b.post_id, p.name AS post_name,
        b.created_at, b.updated_at
       FROM banner b
       LEFT JOIN post p ON b.post_id = p.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Update banner by ID
  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Dynamically add fields if provided
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
    if (data.post_id) {
      fields.push(`post_id = $${paramIndex++}`);
      values.push(data.post_id);
    }
    if (data.language) {
      fields.push(`language = $${paramIndex++}`);
      values.push(data.language);
    }

    if (fields.length === 0) return null;

    // Add updated_at and WHERE condition
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE banner 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING id, engtitle, engdescription, arabtitle, arabdescription, post_id, language, created_at, updated_at`,
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

  // 🟩 Update single banner (no ID — update the first banner)
  static async updateSingle(data) {
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
    if (data.post_id) {
      fields.push(`post_id = $${paramIndex++}`);
      values.push(data.post_id);
    }
    if (data.language) {
      fields.push(`language = $${paramIndex++}`);
      values.push(data.language);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const result = await pool.query(
      `UPDATE banner 
       SET ${fields.join(", ")}
       WHERE id = (SELECT id FROM banner ORDER BY created_at ASC LIMIT 1)
       RETURNING id, engtitle, engdescription, arabtitle, arabdescription, post_id, language, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }
}

module.exports = BannerModel;
