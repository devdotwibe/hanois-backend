/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.alterColumn("work", "build_area", { type: "double precision" });
  pgm.alterColumn("work", "cost_finsh", { type: "double precision" });
  pgm.alterColumn("work", "suggest_cost", { type: "double precision" });
  pgm.alterColumn("work", "total_cost", { type: "double precision" });

  // OPTIONAL: if you want status to be text instead of varchar.
  pgm.alterColumn("work", "status", { type: "text" });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.alterColumn("work", "build_area", { type: "integer" });
  pgm.alterColumn("work", "cost_finsh", { type: "integer" });
  pgm.alterColumn("work", "suggest_cost", { type: "integer" });
  pgm.alterColumn("work", "total_cost", { type: "integer" });

  pgm.alterColumn("work", "status", { type: "varchar(255)" });
};
