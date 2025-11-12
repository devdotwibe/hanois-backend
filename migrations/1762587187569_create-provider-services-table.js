/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("provider_services", {
    id: "id", // Auto-incrementing primary key (serial)

    provider_id: {
      type: "integer",          // <<-- use integer to match providers.id
      notNull: true,
      references: "providers(id)",
      onDelete: "CASCADE",
    },

    service_id: {
      type: "integer",          // <<-- use integer to match services.id
      notNull: true,
      references: "services(id)",
      onDelete: "CASCADE",
    },

    average_cost: {
      type: "numeric(14,2)",
      notNull: false,
    },

    currency: {
      type: "varchar(10)",
      notNull: false,
    },

    service_note: {
      type: "text",
      notNull: false,
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // helpful indexes
  pgm.createIndex("provider_services", "provider_id");
  pgm.createIndex("provider_services", "service_id");
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("provider_services");
};
