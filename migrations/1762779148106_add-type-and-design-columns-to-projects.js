/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("projects", {
    project_type_id: {
      type: "integer",
      references: "categories(id)",
      onDelete: "SET NULL",
    },
    design_id: {
      type: "integer",
      references: "design(id)",
      onDelete: "SET NULL",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("projects", ["project_type_id", "design_id"]);
};
