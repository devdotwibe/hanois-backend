/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('sections', {
    id: { type: 'bigserial', primaryKey: true },
    key: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('fields', {
    id: { type: 'bigserial', primaryKey: true },
    section_id: { type: 'bigint', notNull: true, references: '"sections"', onDelete: 'CASCADE' },
    key: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(50)', notNull: true }, // text, number, image etc
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('field_translations', {
    id: { type: 'bigserial', primaryKey: true },
    field_id: { type: 'bigint', notNull: true, references: '"fields"', onDelete: 'CASCADE' },
    language: { type: 'varchar(10)', notNull: true }, // en, ar
    value: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('field_translations', 'unique_field_language', {
    unique: ['field_id', 'language'],
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('field_translations');
  pgm.dropTable('fields');
  pgm.dropTable('sections');
};
