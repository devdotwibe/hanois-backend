/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
 const shorthands = undefined;

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {

      pgm.addColumns('users', {

        profile_image: { type: 'varchar(255)',  notNull: false },
     
    });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {

         pgm.dropColumns('users', [
        'profile_image',
     ]);
};
