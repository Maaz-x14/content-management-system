'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_listings', {
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
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      location_type: {
        type: Sequelize.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: false,
      },
      location_city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      location_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      remote_policy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      employment_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'internship'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      responsibilities: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      qualifications_required: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      qualifications_preferred: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      benefits: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      salary_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      salary_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      salary_currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      salary_visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'closed', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      posted_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
    await queryInterface.addIndex('job_listings', ['slug'], {
      unique: true,
      name: 'job_listings_slug_unique',
    });
    await queryInterface.addIndex('job_listings', ['status']);
    await queryInterface.addIndex('job_listings', ['department']);
    await queryInterface.addIndex('job_listings', ['location_type']);
    await queryInterface.addIndex('job_listings', ['employment_type']);
    await queryInterface.addIndex('job_listings', ['posted_by']);
    await queryInterface.addIndex('job_listings', ['application_deadline']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_listings');
  },
};
