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

pgm.addColumns("design", {

    quality: { type: "integer", notNull: false },
    cost: { type: "integer", notNull: false },
    rate: { type: "integer", notNull: false },

  });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {

     pgm.dropColumns("design", ["quality","cost","rate"]);
};
