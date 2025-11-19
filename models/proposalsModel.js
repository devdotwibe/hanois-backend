const db = require("../db/pool");
// your PostgreSQL db connection

const ProposalsModel = {
  
  /** -------------------------
   *  Create a new proposal
   *  ------------------------*/
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


  /** -------------------------
   *  Check if proposal exists
   *  ------------------------*/
  async checkExisting(provider_id, work_id) {
    const result = await db.query(
      `SELECT * FROM proposals WHERE provider_id = $1 AND work_id = $2`,
      [provider_id, work_id]
    );
    return result.rows[0];
  },


  /** -------------------------
   *  Get all proposals for a provider
   *  ------------------------*/
  async getByProvider(provider_id) {
    const result = await db.query(
      `SELECT * FROM proposals WHERE provider_id = $1 ORDER BY created_at DESC`,
      [provider_id]
    );
    return result.rows;
  },


  /** -------------------------
   *  Get all proposals for a user/customer
   *  ------------------------*/
  async getByUser(user_id) {
    const result = await db.query(
      `SELECT * FROM proposals WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },


  /** -------------------------
   *  Get proposal by ID
   *  ------------------------*/
  async getById(id) {
    const result = await db.query(
      `SELECT * FROM proposals WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }
};

module.exports = ProposalsModel;
