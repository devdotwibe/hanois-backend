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
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

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

  // 🟩 Find banner by post_id + language
  static async findByPostAndLang(post_id, language) {
    const result = await pool.query(
      `SELECT * FROM banner WHERE post_id = $1 AND language = $2 LIMIT 1`,
      [post_id, language]
    );
    return result.rows[0];
  }

  // 🟩 Update banner by ID
  static async updateById(id, data) {
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      "engtitle",
      "engdescription",
      "arabtitle",
      "arabdescription",
      "post_id",
      "language",
    ];

    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    // Always update timestamp
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
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

    const result = await pool.query(
      `DELETE FROM banner WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Update first banner (if needed for fallback)
  static async updateSingle(data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      "engtitle",
      "engdescription",
      "arabtitle",
      "arabdescription",
      "post_id",
      "language",
    ];

    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
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

  // 🟩 Update both English and Arabic banners (helper)
  static async updateEnglishAndArabic(data) {
    const { engtitle, engdescription, arabtitle_ar, arabdescription_ar } = data;

    const enResult = await pool.query(
      `UPDATE banner
       SET engtitle = $1, engdescription = $2, updated_at = NOW()
       WHERE language = 'en'
       RETURNING *`,
      [engtitle, engdescription]
    );

    const arResult = await pool.query(
      `UPDATE banner
       SET arabtitle = $1, arabdescription = $2, updated_at = NOW()
       WHERE language = 'ar'
       RETURNING *`,
      [arabtitle_ar, arabdescription_ar]
    );

    return {
      english: enResult.rows[0],
      arabic: arResult.rows[0],
    };
  }
}

module.exports = BannerModel;
