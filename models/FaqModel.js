const pool = require("../db/pool");

class FaqModel {
  /**
   * 🟩 Get all FAQs (with optional language filter)
   */
  static async getAll(language = null) {
    let query = `
      SELECT 
        f.id,
        f.title,
        f.question,
        f.answer,
        f.language,
        f.post_name,
        f.post_id,
        p.name AS post_display_name
      FROM faqcontent f
      LEFT JOIN post p ON f.post_id = p.id
    `;

    const values = [];

    // ✅ Add optional filter for language
    if (language) {
      query += ` WHERE f.language = $1`;
      values.push(language);
    }

    query += ` ORDER BY f.id DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * 🟩 Get all FAQs by a specific language (shortcut)
   */
  static async getAllByLanguage(language) {
    return await this.getAll(language);
  }

  /**
   * 🟩 Create a new FAQ
   */
  static async create(data) {
    const {
      title = null,
      question = null,
      answer = null,
      language = "en",
      post_name = null,
      post_id = null,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO faqcontent (title, question, answer, language, post_name, post_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, question, answer, language, post_name, post_id
      `,
      [title, question, answer, language, post_name, post_id]
    );

    return result.rows[0];
  }

  /**
   * 🟩 Find FAQ by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `
      SELECT 
        f.id, f.title, f.question, f.answer, 
        f.language, f.post_name, f.post_id, 
        p.name AS post_display_name
      FROM faqcontent f
      LEFT JOIN post p ON f.post_id = p.id
      WHERE f.id = $1
      `,
      [id]
    );
    return result.rows[0];
  }

  /**
   * 🟩 Find FAQ by post_id and language
   */
  static async findByPostAndLang(post_id, language) {
    const result = await pool.query(
      `SELECT * FROM faqcontent WHERE post_id = $1 AND language = $2 LIMIT 1`,
      [post_id, language]
    );
    return result.rows[0];
  }

  /**
   * 🟩 Update FAQ by ID
   */
  static async updateById(id, data) {
    const updatableFields = [
      "title",
      "question",
      "answer",
      "language",
      "post_name",
      "post_id",
    ];

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await pool.query(
      `
      UPDATE faqcontent
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, title, question, answer, language, post_name, post_id
      `,
      values
    );

    return result.rows[0];
  }

  /**
   * 🟩 Delete FAQ by ID
   */
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM faqcontent WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = FaqModel;
y