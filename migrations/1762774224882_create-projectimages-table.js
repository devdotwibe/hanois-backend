/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("projectimages", {
    id: "id",
    project_id: {
      type: "integer",
      notNull: true,
      references: '"projects"(id)',
      onDelete: "cascade",
    },
    provider_id: {
      type: "integer",
      notNull: true,
      references: '"providers"(id)',
      onDelete: "cascade",
    },
    image_path: { type: "varchar(255)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("projectimages");
};
