'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Full system access with all permissions',
        permissions: JSON.stringify({
          users: { create: true, read: true, update: true, delete: true },
          blog: { create: true, read: true, update: true, delete: true, publish: true },
          services: { create: true, read: true, update: true, delete: true, publish: true },
          careers: { create: true, read: true, update: true, delete: true, publish: true },
          media: { upload: true, read: true, update: true, delete: true },
          settings: { read: true, update: true },
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Editor',
        slug: 'editor',
        description: 'Can create and manage content',
        permissions: JSON.stringify({
          users: { create: false, read: true, update: false, delete: false },
          blog: { create: true, read: true, update: true, delete: false, publish: true },
          services: { create: true, read: true, update: true, delete: false, publish: true },
          careers: { create: true, read: true, update: true, delete: false, publish: true },
          media: { upload: true, read: true, update: true, delete: false },
          settings: { read: true, update: false },
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access to content',
        permissions: JSON.stringify({
          users: { create: false, read: false, update: false, delete: false },
          blog: { create: false, read: true, update: false, delete: false, publish: false },
          services: { create: false, read: true, update: false, delete: false, publish: false },
          careers: { create: false, read: true, update: false, delete: false, publish: false },
          media: { upload: false, read: true, update: false, delete: false },
          settings: { read: true, update: false },
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
