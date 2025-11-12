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

    pgm.addColumns('work', {

        provider_id: { type: 'integer[]', notNull: false  },
        service_ids: { type: 'integer[]',  notNull: false },
     
    });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
      pgm.dropColumns('work', [
        'provider_id',
        'service_ids'
     ]);
};
