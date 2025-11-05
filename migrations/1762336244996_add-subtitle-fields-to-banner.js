/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("banner", {
    subtitle: { type: "text", notNull: false },
    subheading: { type: "text", notNull: false },
    buttonname: { type: "text", notNull: false },
    arabicsubtitle: { type: "text", notNull: false },
    arabicsubheading: { type: "text", notNull: false },
    arabicbuttonname: { type: "text", notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("banner", [
    "subtitle",
    "subheading",
    "buttonname",
    "arabicsubtitle",
    "arabicsubheading",
    "arabicbuttonname",
  ]);
};
