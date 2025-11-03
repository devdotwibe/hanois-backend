const pool = require("../db/pool");

class ContactsModel {
  // Get all contacts
  static async getAll() {
    const result = await pool.query(`
      SELECT id, full_name, business_email, company_name, website_url, notes, created_at
      FROM contacts
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // Create a new contact
  static async create(data) {
    const { full_name, business_email, company_name, website_url, notes } = data;

    const result = await pool.query(
      `INSERT INTO contacts (full_name, business_email, company_name, website_url, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, business_email, company_name, website_url, notes, created_at`,
      [full_name, business_email, company_name, website_url, notes]
    );

    return result.rows[0];
  }

  // Find contact by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT id, full_name, business_email, company_name, website_url, notes, created_at
       FROM contacts
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Update contact by ID
  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.full_name) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(data.full_name);
    }
    if (data.business_email) {
      fields.push(`business_email = $${paramIndex++}`);
      values.push(data.business_email);
    }
    if (data.company_name) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(data.company_name);
    }
    if (data.website_url) {
      fields.push(`website_url = $${paramIndex++}`);
      values.push(data.website_url);
    }
    if (data.notes) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    // add id at the end for the WHERE clause
    values.push(id);

    const result = await pool.query(
      `UPDATE contacts SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, full_name, business_email, company_name, website_url, notes, created_at`,
      values
    );

    return result.rows[0];
  }

  // Delete contact by ID
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM contacts WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = ContactsModel;
