/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Add comment_id column
  pgm.addColumn("likes_dislikes", {
    comment_id: {
      type: "integer",
      references: '"comments"',
      onDelete: "CASCADE",
      notNull: true
    }
  });

  // Make project_id nullable (we won't use it)
  pgm.alterColumn("likes_dislikes", "project_id", { notNull: false });

  // Ensure provider_id is stored
  pgm.addColumn("likes_dislikes", {
    provider_id: {
      type: "integer",
      references: '"providers"',
      onDelete: "CASCADE",
      notNull: true
    }
  });

  // user_id no longer required
  pgm.alterColumn("likes_dislikes", "user_id", { notNull: false });
};

exports.down = pgm => {
  pgm.dropColumn("likes_dislikes", "comment_id");
  pgm.dropColumn("likes_dislikes", "provider_id");
};
