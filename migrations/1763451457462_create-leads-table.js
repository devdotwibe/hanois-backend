/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('leads', {
    id: 'id', // auto increment

    work_id: {
      type: 'integer',
      notNull: false,
      references: '"work"',
      onDelete: 'CASCADE'
    },

    provider_id: {
      type: 'integer',
      notNull: false,
      references: '"providers"',
      onDelete: 'CASCADE'
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  });

  pgm.addConstraint('leads', 'unique_provider_work', {
    unique: ['provider_id', 'work_id']
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('leads');
};
