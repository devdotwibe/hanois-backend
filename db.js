const { config } = require('./config/env');

module.exports = {
  databaseUrl: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
  },
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};
