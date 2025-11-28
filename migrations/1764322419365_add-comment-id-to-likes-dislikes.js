/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Add comment_id column
  pgm.addColumn("likes_dislikes", {
    comment_id: {
      type: "integer",
      references: `"comments"`,
      onDelete: "CASCADE",
      default: null
    }
  });

  // Allow project_id to be nullable -> needed when reacting to comments
  pgm.alterColumn("likes_dislikes", "project_id", { notNull: false });

  // Allow user_id or provider_id depending on your schema
  pgm.alterColumn("likes_dislikes", "user_id", { notNull: false });
};

exports.down = pgm => {
  pgm.dropColumn("likes_dislikes", "comment_id");
};
