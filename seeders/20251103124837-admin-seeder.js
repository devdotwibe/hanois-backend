"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("H@NNoi", 10);

    await queryInterface.bulkInsert(
      "Admins",
      [
        {
          name: "Super Admin",
          email: "admin@hanois.com",
          password: hashedPassword,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Admins", { email: "admin@hanois.com" }, {});
  },
};
