/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("projects", {
    id: "id",
    provider_id: {
      type: "integer",
      notNull: true,
      references: '"providers"(id)',
      onDelete: "cascade",
    },
    title: { type: "varchar(255)", notNull: true },
    notes: { type: "text" },
    location: { type: "varchar(255)" },
    land_size: { type: "varchar(100)" },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("projects");
};
