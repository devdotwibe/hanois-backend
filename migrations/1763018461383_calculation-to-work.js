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

        build_area: { type: 'integer', notNull: false  },
        cost_finsh: { type: 'integer',  notNull: false },
        suggest_cost: { type: 'integer',  notNull: false },
        total_cost: { type: 'integer',  notNull: false },
        status: { type: 'varchar(255)',  notNull: false },
     
    });
};

/**
 * @param  {import('node-pg-migrate').MigrationBuilder} pgm
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {

     pgm.dropColumns('work', [
        'build_area',
        'cost_finsh',
        'suggest_cost',
        'total_cost',
        'status'
     ]);
};
