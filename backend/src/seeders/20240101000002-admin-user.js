'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the default password
    const passwordHash = await bcrypt.hash('Admin@123456', 12);

    // Get the Super Admin role ID
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE slug = 'super-admin' LIMIT 1;"
    );

    if (roles.length === 0) {
      throw new Error('Super Admin role not found. Please run roles seeder first.');
    }

    const superAdminRoleId = roles[0].id;

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@morphelabs.com',
        password_hash: passwordHash,
        full_name: 'System Administrator',
        role_id: superAdminRoleId,
        is_active: true,
        last_login: null,
        password_reset_token: null,
        password_reset_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@morphelabs.com' }, {});
  },
};
