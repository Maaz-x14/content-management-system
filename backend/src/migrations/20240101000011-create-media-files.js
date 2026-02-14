'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media_files', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      thumbnail_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      file_type: {
        type: Sequelize.ENUM('image', 'document', 'video', 'other'),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      image_width: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      image_height: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      uploaded_by: {
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
    await queryInterface.addIndex('media_files', ['filename'], {
      unique: true,
      name: 'media_files_filename_unique',
    });
    await queryInterface.addIndex('media_files', ['file_type']);
    await queryInterface.addIndex('media_files', ['uploaded_by']);
    await queryInterface.addIndex('media_files', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media_files');
  },
};
