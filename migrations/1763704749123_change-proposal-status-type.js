/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // 1. Rename old boolean column
  pgm.renameColumn("proposals", "is_accepted", "status_old");

  // 2. Add new VARCHAR status column
  pgm.addColumns("proposals", {
    status: {
      type: "varchar(50)",
      notNull: false,
      default: "ProposalSent",
    },
  });

  // 3. Convert boolean values to strings
  pgm.sql(`
    UPDATE proposals
    SET status =
      CASE
        WHEN status_old = TRUE THEN 'Accepted'
        WHEN status_old = FALSE THEN 'Rejected'
        ELSE 'ProposalSent'
      END
  `);

  // 4. Remove old column
  pgm.dropColumns("proposals", ["status_old"]);
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  // Reverse migration
  pgm.addColumns("proposals", {
    status_old: {
      type: "boolean",
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE proposals
    SET status_old =
      CASE
        WHEN status = 'Accepted' THEN TRUE
        WHEN status = 'Rejected' THEN FALSE
        ELSE NULL
      END
  `);

  pgm.dropColumns("proposals", ["status"]);
  pgm.renameColumn("proposals", "status_old", "is_accepted");
};
