'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Articles about web development, frameworks, and best practices',
        parent_id: null,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Mobile Apps',
        slug: 'mobile-apps',
        description: 'Mobile application development for iOS and Android',
        parent_id: null,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design, graphic design, and design systems',
        parent_id: null,
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest technology trends and innovations',
        parent_id: null,
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business strategy, growth, and entrepreneurship',
        parent_id: null,
        display_order: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Case Studies',
        slug: 'case-studies',
        description: 'Real-world project case studies and success stories',
        parent_id: null,
        display_order: 6,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
