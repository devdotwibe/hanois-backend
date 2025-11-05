/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {

  pgm.createTable("banner", {
    id: "id",
    engtitle: { type: "text", notNull: true },
    engdescription: { type: "text", notNull: true },
    arabtitle: { type: "text", notNull: true },
    arabdescription: { type: "text", notNull: true },
    post_id: { type: "integer" }, 
    language: { type: "text", notNull: true, default: "en" },
    englishheading1: { type: "varchar(255)", notNull: false },
    englishheading2: { type: "varchar(255)", notNull: false },
    englishheading3: { type: "varchar(255)", notNull: false },
    arabicheading1: { type: "varchar(255)", notNull: false },
    arabicheading2: { type: "varchar(255)", notNull: false },
    arabicheading3: { type: "varchar(255)", notNull: false },
    image1: { type: "text", notNull: false },
    image2: { type: "text", notNull: false },
    image3: { type: "text", notNull: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("banner");
};
