/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1️⃣ Make user_id nullable
  pgm.alterColumn("comments", "user_id", {
    notNull: false,
  });

  // 2️⃣ Add provider_id column
  pgm.addColumn("comments", {
    provider_id: {
      type: "integer",
      references: '"providers"',  // or "users" depending on your provider table
      onDelete: "SET NULL",
    },
  });
};

exports.down = (pgm) => {
  // Undo provider_id
  pgm.dropColumn("comments", "provider_id");

  // Undo nullable change on user_id (make NOT NULL again)
  pgm.alterColumn("comments", "user_id", {
    notNull: true,
  });
};
