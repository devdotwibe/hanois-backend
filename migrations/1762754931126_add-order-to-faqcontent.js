/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn("faqcontent", {
    order: { type: "integer", notNull: false, default: 0 },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("faqcontent", "order");
};
