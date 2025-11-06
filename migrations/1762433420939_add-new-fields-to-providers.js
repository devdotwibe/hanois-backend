/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.addColumns('providers', {
    categories_id: { type: 'integer[]', comment: 'Array of category IDs' },
    notes: { type: 'text', comment: 'Provider notes' },
    facebook: { type: 'varchar(255)', comment: 'Facebook link' },
    instagram: { type: 'varchar(255)', comment: 'Instagram link' },
    other_link: { type: 'varchar(255)', comment: 'Other link or URL' },
    service_id: { type: 'integer[]', comment: 'Array of service IDs' },
  });
};
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */


exports.down = (pgm) => {
  pgm.dropColumns('providers', [
    'categories_id',
    'notes',
    'facebook',
    'instagram',
    'other_link',
    'service_id',
  ]);
};
