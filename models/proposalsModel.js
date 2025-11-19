const db = require("../db/pool");

const ProposalsModel = {

  /** --------------------------------------------------
   *  Create a new proposal
   * --------------------------------------------------*/
  async createProposal({
    user_id,
    provider_id,
    work_id,
    title,
    budget,
    timeline,
    description,
    attachment
  }) {
    const query = `
      INSERT INTO proposals (
        user_id,
        provider_id,
        work_id,
        title,
        budget,
        timeline,
        description,
        attachment
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;

    const values = [
      user_id,
      provider_id,
      work_id,
      title,
      budget,
      timeline,
      description,
      attachment
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /** --------------------------------------------------
   *  Check if proposal exists for provider + work
   * --------------------------------------------------*/
  async checkExisting(provider_id, work_id) {
    const query = `
      SELECT * FROM proposals 
      WHERE provider_id = $1 AND work_id = $2
    `;
    const { rows } = await db.query(query, [provider_id, work_id]);
    return rows[0] || null;
  },

  /** --------------------------------------------------
   *  Get all proposals submitted by a provider
   * --------------------------------------------------*/
  async getByProvider(provider_id) {
    const query = `
      SELECT * FROM proposals
      WHERE provider_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [provider_id]);
    return rows;
  },

  /** --------------------------------------------------
   *  Get all proposals received by a user
   * --------------------------------------------------*/
  async getByUser(user_id) {
    const query = `
      SELECT * FROM proposals
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [user_id]);
    return rows;
  },

  /** --------------------------------------------------
   *  Get a single proposal by ID
   * --------------------------------------------------*/
  async getById(id) {
    const query = `
      SELECT * FROM proposals 
      WHERE id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
};

module.exports = ProposalsModel;
