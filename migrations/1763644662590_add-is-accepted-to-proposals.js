/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.addColumns("proposals", {
    is_accepted: {
      type: "boolean",
      notNull: false,
      default: null, // NULL = pending, true = accepted, false = rejected
    },
  });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumns("proposals", ["is_accepted"]);
};
