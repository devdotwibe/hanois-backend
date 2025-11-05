/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('faqs', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    description: { type: 'varchar(255)', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('faqs');
};
