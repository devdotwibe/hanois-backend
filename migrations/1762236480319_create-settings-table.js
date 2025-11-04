exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('settings', {
    id: 'id',
    key: { type: 'varchar(255)', notNull: true, unique: true },
    value: { type: 'text', notNull: true },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('settings', 'key');
};

exports.down = (pgm) => {
  pgm.dropTable('settings');
};
