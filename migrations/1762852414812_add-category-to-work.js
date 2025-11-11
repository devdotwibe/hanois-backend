/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // First, set non-numeric values to NULL
  pgm.sql(`
    UPDATE work
    SET project_type = NULL
    WHERE project_type !~ '^[0-9]+$' OR project_type IS NULL OR project_type = '';

    UPDATE work
    SET luxury_level = NULL
    WHERE luxury_level !~ '^[0-9]+$' OR luxury_level IS NULL OR luxury_level = '';

    UPDATE work
    SET services = NULL
    WHERE services !~ '^[0-9]+$' OR services IS NULL OR services = '';
  `);

  // Now safely cast to integer
  pgm.alterColumn("work", "project_type", {
    type: "integer",
    using: "project_type::integer"
  });

  pgm.alterColumn("work", "luxury_level", {
    type: "integer",
    using: "luxury_level::integer"
  });

  pgm.alterColumn("work", "services", {
    type: "integer",
    using: "services::integer"
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.alterColumn("work", "project_type", { type: "varchar(255)" });
  pgm.alterColumn("work", "luxury_level", { type: "varchar(255)" });
  pgm.alterColumn("work", "services", { type: "varchar(255)" });
};
