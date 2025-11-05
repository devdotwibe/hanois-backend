/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("faqcontent", {
    id: "id",
    title: { type: "varchar(255)", notNull: true },
    question: { type: "text", notNull: false },
    answer: { type: "text", notNull: false },
    language: { type: "varchar(10)", notNull: false, default: "en" }, // optional multi-language support
    post_name: { type: "varchar(255)" },
    post_id: { type: "integer" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("faqcontent");
};
