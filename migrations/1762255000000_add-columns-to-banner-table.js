/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("banner", {
    englishheading1: { type: "varchar(255)", notNull: false },
    englishheading2: { type: "varchar(255)", notNull: false },
    englishheading3: { type: "varchar(255)", notNull: false },
    arabicheading1: { type: "varchar(255)", notNull: false },
    arabicheading2: { type: "varchar(255)", notNull: false },
    arabicheading3: { type: "varchar(255)", notNull: false },
    image1: { type: "text", notNull: false },
    image2: { type: "text", notNull: false },
    image3: { type: "text", notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("banner", [
    "englishheading1",
    "englishheading2",
    "englishheading3",
    "arabicheading1",
    "arabicheading2",
    "arabicheading3",
    "image1",
    "image2",
    "image3",
  ]);
};
