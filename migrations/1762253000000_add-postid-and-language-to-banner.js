exports.up = (pgm) => {
  pgm.addColumn("banner", {
    post_id: {
      type: "integer",
      references: "post(id)",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    language: { type: "text", notNull: true, default: "en" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("banner", ["post_id", "language"]);
};
