/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("banner", {
    id: "id",
    title: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: true },
    heading1: { type: "varchar(255)" },
    heading2: { type: "varchar(255)" },
    heading3: { type: "varchar(255)" },
    image1: { type: "text" },
    image2: { type: "text" },
    image3: { type: "text" },
    language: { type: "varchar(10)", notNull: true, default: "en" },
    post_name: { type: "varchar(255)" },
    subtitle: { type: "text", notNull: false },
    subheading: { type: "text", notNull: false },
    buttonname: { type: "text", notNull: false },
   
   post_id: { type: "integer" }, 
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("banner");
};


