/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {

    pgm.addColumns('providers', {

        provider_id: { type: 'integer[]', notNull: false  },
        service_ids: { type: 'integer[]',  notNull: false },
     
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
      pgm.dropColumns('providers', [
        'provider_id',
        'service_ids'
     ]);
};
