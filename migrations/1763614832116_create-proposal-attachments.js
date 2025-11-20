/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;


/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('proposal_attachments', {
    id: 'id', // auto increment primary key

    proposal_id: {
      type: 'integer',
      notNull: true,
      references: '"proposals"',
      onDelete: 'CASCADE'
    },

    attachment: {
      type: 'text', // stores file path or filename
      notNull: true
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('proposal_attachments');
};
