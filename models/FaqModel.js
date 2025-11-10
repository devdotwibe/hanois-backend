const pool = require("../db/pool");

class FaqModel {
  // 🟩 Get all FAQs (with post info)
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        f.id,
        f.title,
        f.question,
        f.answer,
        f.language,
        f.post_name,
        f.post_id,
          f.order,
        p.name AS post_display_name
      FROM faqcontent f
      LEFT JOIN post p ON f.post_id = p.id
      ORDER BY f.order ASC, f.id ASC
    `);
    return result.rows;
  }

  // 🟩 Create new FAQ
static async create(data) {
  const { title, question, answer, language = "en", post_name, post_id, order = 0 } = data;

  const result = await pool.query(
    `INSERT INTO faqcontent (title, question, answer, language, post_name, post_id, order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, question, answer, language, post_name, post_id, order`,
    [title, question, answer, language, post_name, post_id, order]
  );
  return result.rows[0];
}


  // 🟩 Find FAQ by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT 
         f.id, f.title, f.question, f.answer, 
         f.language, f.post_name, f.post_id, p.name AS post_display_name
       FROM faqcontent f
       LEFT JOIN post p ON f.post_id = p.id
       WHERE f.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Find FAQ by post_id and language
  static async findByPostAndLang(post_id, language) {
    const result = await pool.query(
      `SELECT * FROM faqcontent WHERE post_id = $1 AND language = $2 LIMIT 1`,
      [post_id, language]
    );
    return result.rows[0];
  }

  // 🟩 Update FAQ by ID
  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = ["title", "question", "answer", "language", "post_name", "post_id", "order"];


    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;
    values.push(id);

    const result = await pool.query(
      `UPDATE faqcontent 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING id, title, question, answer, language, post_name, post_id`,
      values
    );

    return result.rows[0];
  }

  // 🟩 Delete FAQ by ID
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM faqcontent WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = FaqModel;
