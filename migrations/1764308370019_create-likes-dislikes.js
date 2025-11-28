/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('likes_dislikes', {
    id: 'id', // auto increment primary key

    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },

    project_id: {
      type: 'integer',
      notNull: true,
      references: '"projects"',
      onDelete: 'CASCADE',
    },

    type: {
      type: "varchar(10)", // 'like' or 'dislike'
      notNull: true,
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  // Prevent multiple reactions per user on same project
  pgm.addConstraint(
    'likes_dislikes',
    'unique_user_project_reaction',
    'UNIQUE(user_id, project_id)'
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('likes_dislikes');
};
