/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("project_images", {
    is_cover: { type: "boolean", default: false, notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("project_images", "is_cover");
};
