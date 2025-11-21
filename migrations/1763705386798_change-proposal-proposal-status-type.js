/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {

  // 1️⃣ Rename old boolean column is_accepted → status_old
  pgm.renameColumn("proposals", "is_accepted", "status_old");

  // 2️⃣ Add new VARCHAR column proposalstatus
  pgm.addColumns("proposals", {
    proposalstatus: {
      type: "varchar(50)",
      notNull: false,
      default: "ProposalSent",
    },
  });

  // 3️⃣ Convert boolean → text status
  pgm.sql(`
    UPDATE proposals
    SET proposalstatus =
      CASE
        WHEN status_old = TRUE THEN 'Accepted'
        WHEN status_old = FALSE THEN 'Rejected'
        ELSE 'ProposalSent'
      END
  `);

  // 4️⃣ Remove old boolean column
  pgm.dropColumns("proposals", ["status_old"]);
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {

  // Reverse: Add back boolean column
  pgm.addColumns("proposals", {
    status_old: {
      type: "boolean",
      notNull: false,
    },
  });

  // Convert string → boolean
  pgm.sql(`
    UPDATE proposals
    SET status_old =
      CASE
        WHEN proposalstatus = 'Accepted' THEN TRUE
        WHEN proposalstatus = 'Rejected' THEN FALSE
        ELSE NULL
      END
  `);

  // Drop proposalstatus
  pgm.dropColumns("proposals", ["proposalstatus"]);

  // Rename status_old → is_accepted
  pgm.renameColumn("proposals", "status_old", "is_accepted");
};
