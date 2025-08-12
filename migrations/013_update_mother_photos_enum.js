const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update photo_type ENUM to include new values
    await queryInterface.sequelize.query(`
      ALTER TABLE tbl_mother_photos 
      MODIFY COLUMN photo_type ENUM('mother_with_child', 'prescription', 'certificate', 'plant_distribution') 
      NOT NULL COMMENT 'फोटो का प्रकार (प्रमाण पत्र या पौधा वितरण फोटो)'
    `);
    
    console.log('✅ Updated photo_type ENUM values in tbl_mother_photos table');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to original ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE tbl_mother_photos 
      MODIFY COLUMN photo_type ENUM('mother_with_child', 'prescription') 
      NOT NULL COMMENT 'फोटो का प्रकार (माँ-बच्चे की फोटो या प्रिस्क्रिप्शन)'
    `);
    
    console.log('✅ Reverted photo_type ENUM values in tbl_mother_photos table');
  }
};
