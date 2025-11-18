const pool = require("../db/pool");

class LeadsModel {

  // Create a new lead entry
  static async createLead(data) {
    const { work_id, provider_id } = data;

    const result = await pool.query(
      `
      INSERT INTO leads (
        work_id,
        provider_id,
        created_at
      )
      VALUES ($1, $2, NOW())
      RETURNING 
        id,
        work_id,
        provider_id,
        created_at
      `,
      [
        Number(work_id) || null,
        Number(provider_id) || null,
      ]
    );

    return result.rows[0];
  }

  // Check if lead already exists
  static async checkExistingLead(work_id, provider_id) {
    const result = await pool.query(
      `
      SELECT id, work_id, provider_id, created_at
      FROM leads
      WHERE work_id = $1 AND provider_id = $2
      LIMIT 1
      `,
      [Number(work_id), Number(provider_id)]
    );

    return result.rows[0] || null;
  }

  // Fetch all leads for a provider
  static async getProviderLeads(provider_id) {
    const result = await pool.query(
      `
      SELECT 
        l.id,
        l.work_id,
        l.provider_id,
        l.created_at
      FROM leads l
      WHERE l.provider_id = $1
      ORDER BY l.created_at DESC
      `,
      [Number(provider_id)]
    );

    return result.rows;
  }

  // Delete lead
  static async deleteLead(id, provider_id) {
    const result = await pool.query(
      `
      DELETE FROM leads
      WHERE id = $1 AND provider_id = $2
      RETURNING id, work_id, provider_id, created_at
      `,
      [Number(id), Number(provider_id)]
    );

    return result.rows[0];
  }
}

module.exports = LeadsModel;
