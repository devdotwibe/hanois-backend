const db = require("../db/pool");

const ProposalAttachmentsModel = {

  async addAttachment(proposal_id, filename) {
    const result = await db.query(
      `
      INSERT INTO proposal_attachments (proposal_id, attachment)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [proposal_id, filename]
    );
    return result.rows[0];
  },

  async getAttachments(proposal_id) {
    const result = await db.query(
      `SELECT * FROM proposal_attachments WHERE proposal_id = $1`,
      [proposal_id]
    );
    return result.rows;
  }
};

module.exports = ProposalAttachmentsModel;
