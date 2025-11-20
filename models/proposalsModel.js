const db = require("../db/pool");

const ProposalsModel = {

  /** --------------------------------------------------
   *  Create a new proposal (with default is_accepted = null)
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
        attachment,
        is_accepted
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL)
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
  },

  /** --------------------------------------------------
   *  UPDATE ACCEPT / REJECT STATUS
   *  is_accepted = true  → accepted
   *  is_accepted = false → rejected
   * --------------------------------------------------*/
  async updateStatus(id, is_accepted) {
    const query = `
      UPDATE proposals
      SET is_accepted = $2
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await db.query(query, [id, is_accepted]);
    return rows[0] || null;
  }
};

module.exports = ProposalsModel;
