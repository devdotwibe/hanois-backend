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
    
    pgm.createTable('providers', {
        id: 'id',
        name: { type: 'varchar(100)', notNull: true },
        email: { type: 'varchar(100)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        phone: { type: 'varchar(20)', notNull: false },
        register_no: { type: 'varchar(50)', notNull: false },
        location: { type: 'varchar(255)', notNull: false },
        team_size: { type: 'integer', notNull: false },
        service: { type: 'text', notNull: false },
        website: { type: 'varchar(255)', notNull: false },
        social_media: { type: 'jsonb', notNull: false, default: '{}' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {

     pgm.dropTable('providers');
};
