/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Add provider_id column
  pgm.addColumn("likes_dislikes", {
    provider_id: {
      type: "integer",
      references: `"providers"`,  // match your providers table
      onDelete: "SET NULL",
      default: null
    }
  });
};

exports.down = pgm => {
  pgm.dropColumn("likes_dislikes", "provider_id");
};
