'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_listings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      applicant_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      applicant_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      applicant_phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      resume_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      resume_filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      portfolio_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('new', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'rejected', 'withdrawn'),
        allowNull: false,
        defaultValue: 'new',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('job_applications', ['job_id']);
    await queryInterface.addIndex('job_applications', ['status']);
    await queryInterface.addIndex('job_applications', ['applicant_email']);
    await queryInterface.addIndex('job_applications', ['applied_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
  },
};
