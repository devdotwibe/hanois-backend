const pool = require("../db/pool");

class BannerModel {
  // 🟩 Get all banners (with related post info)
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.description,
        b.heading1,
        b.heading2,
        b.heading3,
        b.image1,
        b.image2,
        b.image3,
        b.language,
        b.post_name,
        b.post_id,
        p.name AS post_display_name
      FROM banner b
      LEFT JOIN post p ON b.post_id = p.id
      ORDER BY b.id DESC
    `);
    return result.rows;
  }

  // 🟩 Create new banner
  static async create(data) {
    const {
      title,
      description,
      heading1,
      heading2,
      heading3,
      image1,
      image2,
      image3,
      language = "en",
      post_name,
      post_id,
    } = data;

    const result = await pool.query(
      `INSERT INTO banner (
        title, description, heading1, heading2, heading3,
        image1, image2, image3, language, post_name, post_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING 
        id, title, description, heading1, heading2, heading3,
        image1, image2, image3, language, post_name, post_id`,
      [
        title,
        description,
        heading1,
        heading2,
        heading3,
        image1,
        image2,
        image3,
        language,
        post_name,
        post_id,
      ]
    );

    return result.rows[0];
  }

  // 🟩 Find banner by ID
  static async findById(id) {
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

    const result = await pool.query(
      `SELECT 
        b.id,
        b.title,
        b.description,
        b.heading1,
        b.heading2,
        b.heading3,
        b.image1,
        b.image2,
        b.image3,
        b.language,
        b.post_name,
        b.post_id,
        p.name AS post_display_name
      FROM banner b
      LEFT JOIN post p ON b.post_id = p.id
      WHERE b.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  // 🟩 Find banner by post_id and language
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
      "title",
      "description",
      "heading1",
      "heading2",
      "heading3",
      "image1",
      "image2",
      "image3",
      "language",
      "post_name",
      "post_id",
    ];

    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await pool.query(
      `UPDATE banner 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING 
        id, title, description, heading1, heading2, heading3,
        image1, image2, image3, language, post_name, post_id`,
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
}

module.exports = BannerModel;
