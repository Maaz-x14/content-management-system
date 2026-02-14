'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      client_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      project_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      project_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      project_duration: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      technologies: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      industry: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      challenge: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      solution: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      results: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metrics: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('services', ['slug'], {
      unique: true,
      name: 'services_slug_unique',
    });
    await queryInterface.addIndex('services', ['status']);
    await queryInterface.addIndex('services', ['featured']);
    await queryInterface.addIndex('services', ['created_by']);
    await queryInterface.addIndex('services', ['display_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  },
};
