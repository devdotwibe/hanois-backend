const db = require("../db/pool");

const ProposalAttachmentsModel = {

  // ➕ ADD new attachment
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

  // 📌 Get ALL attachments for a proposal
  async getAttachments(proposal_id) {
    const result = await db.query(
      `SELECT * FROM proposal_attachments WHERE proposal_id = $1`,
      [proposal_id]
    );
    return result.rows;
  },

  // 📌 Get single attachment by ID (needed for deletion)
  async getAttachmentById(id) {
    const result = await db.query(
      `SELECT * FROM proposal_attachments WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // 🗑 DELETE attachment by ID from DB
  async deleteAttachment(id) {
    return db.query(
      `DELETE FROM proposal_attachments WHERE id = $1`,
      [id]
    );
  }
};

module.exports = ProposalAttachmentsModel;
