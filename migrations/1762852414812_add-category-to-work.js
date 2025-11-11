/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE work
    SET project_type = NULLIF(project_type, '')::integer,
        luxury_level = NULLIF(luxury_level, '')::integer,
        services = NULLIF(services, '')::integer;
  `);

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
