const pool = require("../db/pool");

class designModel {

  static async getAll() {
    const result = await pool.query(`
      SELECT DISTINCT d.*
      FROM design d
      JOIN projects p ON d.id = p.design_id
      ORDER BY d.id ASC
    `);

    return result.rows;
  }


  static async findById(id) {
    const result = await pool.query("SELECT * FROM design WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(data) {

    const { name,build_cost,fee_rate,quality } = data;

   if (fee_rate !== undefined) {
      const existing = await pool.query(
        `SELECT id FROM design WHERE rate = $1 LIMIT 1`,
        [fee_rate]
      );

      if (existing.rows.length > 0) {
        const error = new Error("Design with this Fee Rate already exists");
        error.field = "feeRate";
        throw error;
      }
    }
    
    const result = await pool.query(
      `INSERT INTO design (name, cost, rate, quality, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, cost, rate, quality, created_at`,
      [name, build_cost, fee_rate, quality]
    );

    return result.rows[0];
  }

  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.fee_rate !== undefined) {
      const existing = await pool.query(
        `SELECT id FROM design WHERE rate = $1 AND id <> $2 LIMIT 1`,
        [data.fee_rate, id]
      );

      if (existing.rows.length > 0) {
        const error = new Error("Design with this Fee Rate already exists");
        error.field = "feeRate";
        throw error;
      }
    }


    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.build_cost !== undefined) {
      fields.push(`cost = $${paramIndex++}`);
      values.push(data.build_cost);
    }

    if (data.fee_rate !== undefined) {
      fields.push(`rate = $${paramIndex++}`);
      values.push(data.fee_rate);
    }

    if (data.quality !== undefined) {
      fields.push(`quality = $${paramIndex++}`);
      values.push(data.quality);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    values.push(id);

    const query = `
      UPDATE design
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, name,cost,rate, quality, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }


  // 🟩 Delete a design by ID
  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM design WHERE id = $1 RETURNING id, name",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = designModel;
