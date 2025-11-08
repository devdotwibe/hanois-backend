/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable("provider_services", {
    id: "id", // Auto-incrementing primary key (serial)

    provider_id: {
      type: "varchar(128)",
      notNull: true,
      references: "providers(id)", // assumes you already have a providers table
      onDelete: "CASCADE",
    },

    service_id: {
      type: "varchar(128)",
      notNull: true,
      references: "services(id)", // assumes you have a services table
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

  // Add helpful indexes for fast lookups
  pgm.createIndex("provider_services", "provider_id");
  pgm.createIndex("provider_services", "service_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable("provider_services");
};
