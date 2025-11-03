/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("banner", {
    id: "id",
    engtitle: { type: "text", notNull: true },
    engdescription: { type: "text", notNull: true },
    arabtitle: { type: "text", notNull: true },
    arabdescription: { type: "text", notNull: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("banner");
};
