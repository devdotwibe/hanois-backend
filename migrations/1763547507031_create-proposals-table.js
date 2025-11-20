/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('proposals', {
    id: 'id', // auto increment primary key

    user_id: {
      type: 'integer',
      notNull: false,
      references: '"users"',
      onDelete: 'CASCADE'
    },

    provider_id: {
      type: 'integer',
      notNull: false,
      references: '"providers"',
      onDelete: 'CASCADE'
    },

    work_id: {
      type: 'integer',
      notNull: false,
      references: '"work"',
      onDelete: 'CASCADE'
    },

    title: {
      type: 'text',
      notNull: false
    },

    budget: {
      type: 'text',
      notNull: false
    },

    timeline: {
      type: 'text',
      notNull: false
    },

    description: {
      type: 'text',
      notNull: false
    },

    attachment: {
      type: 'text', // will store file path or file name
      notNull: false
    },

    status: {
      type: 'text',
      notNull: false,
      default: 'sent'
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  });

  // Optional → prevent multiple proposals from same provider for same work
  pgm.addConstraint('proposals', 'unique_provider_proposal_on_work', {
    unique: ['provider_id', 'work_id']
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('proposals');
};
