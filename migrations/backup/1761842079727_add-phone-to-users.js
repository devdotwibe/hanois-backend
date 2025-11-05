exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumn('users', {
        phone: { type: 'varchar(20)', notNull: false }
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('users', 'phone');
};
