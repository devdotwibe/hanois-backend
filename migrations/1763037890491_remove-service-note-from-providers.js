/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports,up = (pgm) => {
  // Drop the 'service_notes' column from the 'providers' table
  pgm.sql('ALTER TABLE providers DROP COLUMN service_notes;');
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Add the 'service_notes' column back to the 'providers' table
  pgm.sql('ALTER TABLE providers ADD COLUMN service_notes TEXT;');
};
