/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("banner", {
    subdescription: { type: "text", notNull: false },
    subbuttonname: { type: "text", notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("banner", ["subdescription", "subbuttonname"]);
};
