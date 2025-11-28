/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: 'id', // auto increment primary key

    project_id: {
      type: 'integer',
      notNull: true,
      references: '"projects"',
      onDelete: 'CASCADE',
    },

    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },

    parent_id: {
      type: 'integer',
      references: '"comments"',
      onDelete: 'CASCADE',
    },

    message: {
      type: 'text',
      notNull: true,
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('comments');
};
