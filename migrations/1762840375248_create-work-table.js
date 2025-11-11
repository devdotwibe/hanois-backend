/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('work', {
    id: 'id',

    user_id: {
      type: 'integer',
      references: '"users"',  
      onDelete: 'SET NULL'
    },

    title: { type: 'varchar(255)', notNull: false },
    notes: { type: 'text', notNull: false },
    project_type: { type: 'varchar(255)', notNull: false },
    location: { type: 'varchar(255)', notNull: false },
    land_size: { type: 'varchar(255)', notNull: false },
    luxury_level: { type: 'varchar(255)', notNull: false },
    services: { type: 'varchar(255)', notNull: false },
    construction_budget: { type: 'varchar(255)', notNull: false },
    basement: { type: 'varchar(10)', notNull: false },             
    listing_style: { type: 'varchar(20)', default: 'private', notNull: false },

    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('work');
};











