exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('contacts', {
    id: 'id',
    full_name: { type: 'varchar(100)', notNull: true },
    business_email: { type: 'varchar(150)', notNull: true },
    company_name: { type: 'varchar(150)' },
    website_url: { type: 'varchar(255)' },
    notes: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('contacts', 'business_email');
};

exports.down = (pgm) => {
  pgm.dropTable('contacts');
};
