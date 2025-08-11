const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a composite unique index to prevent duplicate registrations
    // This ensures that the combination of mother_name, mother_mobile, and child_order is unique
    await queryInterface.addIndex('tbl_child', {
      fields: ['mother_name', 'mother_mobile', 'child_order'],
      name: 'idx_unique_mother_child_registration',
      unique: true
    });

    console.log('✅ Added unique composite index for preventing duplicate mother-child registrations');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the composite unique index
    await queryInterface.removeIndex('tbl_child', 'idx_unique_mother_child_registration');
    
    console.log('✅ Removed unique composite index for mother-child registrations');
  }
};
