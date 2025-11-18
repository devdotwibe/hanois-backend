/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.addColumns("leads", {
    status: { type: "text", notNull: false, default: "Awaiting Review" },
    description: { type: "text", notNull: false },
  });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns("leads", ["status", "description"]);
};
