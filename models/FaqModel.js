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
        f."order",
        p.name AS post_display_name
      FROM faqcontent f
      LEFT JOIN post p ON f.post_id = p.id
  ORDER BY f."order" ASC, f.id ASC
    `);
    return result.rows;
  }

  // 🟩 Create new FAQ
static async create(data) {
  const { title, question, answer, language = "en", post_name, post_id, order = 0 } = data;

const result = await pool.query(
  `INSERT INTO faqcontent (title, question, answer, language, post_name, post_id, "order")
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING id, title, question, answer, language, post_name, post_id, "order"`,
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
// 🟩 Update FAQ by ID with Order Swap Logic
static async updateById(id, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Get current FAQ
    const currentRes = await client.query(
      `SELECT id, "order" FROM faqcontent WHERE id = $1`,
      [id]
    );
    const currentFaq = currentRes.rows[0];
    if (!currentFaq) return null;

    const oldOrder = currentFaq.order;
    const newOrder = parseInt(data.order);

    // 2️⃣ If order is being changed
    if (!isNaN(newOrder) && newOrder !== oldOrder) {
      if (newOrder < oldOrder) {
        // Move all items between newOrder and oldOrder - 1 down by 1
        await client.query(
          `UPDATE faqcontent
           SET "order" = "order" + 1
           WHERE "order" >= $1 AND "order" < $2 AND id <> $3`,
          [newOrder, oldOrder, id]
        );
      } else if (newOrder > oldOrder) {
        // Move all items between oldOrder + 1 and newOrder up by 1
        await client.query(
          `UPDATE faqcontent
           SET "order" = "order" - 1
           WHERE "order" <= $1 AND "order" > $2 AND id <> $3`,
          [newOrder, oldOrder, id]
        );
      }
    }

    // 3️⃣ Build dynamic fields for the main update
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      "title",
      "question",
      "answer",
      "language",
      "post_name",
      "post_id",
      "order",
    ];

    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        const columnName = key === "order" ? `"order"` : key;
        fields.push(`${columnName} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    values.push(id);

    // 4️⃣ Update target FAQ
    const updateRes = await client.query(
      `UPDATE faqcontent
       SET ${fields.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, title, question, answer, language, post_name, post_id, "order"`,
      values
    );

    await client.query("COMMIT");
    return updateRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Order swap failed:", err);
    throw err;
  } finally {
    client.release();
  }
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
