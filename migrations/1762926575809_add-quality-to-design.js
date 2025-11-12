/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {

pgm.addColumns("design", {

    quality: { type: "integer", notNull: false },
    cost: { type: "integer", notNull: false },
    rate: { type: "integer", notNull: false },

  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {

     pgm.dropColumns("design", ["quality","cost","rate"]);
};
