/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("projectimages", {
    is_cover: { type: "boolean", default: false, notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("projectimages", ["is_cover"]);
};
