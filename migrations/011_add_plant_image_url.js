const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add image_url field to master_plant table
    await queryInterface.addColumn('master_plant', 'image_url', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Plant image URL path'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('master_plant', 'image_url');
  }
};
