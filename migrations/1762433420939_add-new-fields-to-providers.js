/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
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
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
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
