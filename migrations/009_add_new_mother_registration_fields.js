const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Adding new mother registration fields to Child table...');
    
    try {
      // Add delivery_time column
      await queryInterface.addColumn('tbl_child', 'delivery_time', {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'प्रसव का समय'
      });
      console.log('✅ Added delivery_time column');

      // Add child_order column 
      await queryInterface.addColumn('tbl_child', 'child_order', {
        type: DataTypes.ENUM('first', 'second', 'third', 'fourth'),
        allowNull: true,
        comment: 'बच्चे का क्रम (पहला, दूसरा, तीसरा, चौथा)'
      });
      console.log('✅ Added child_order column');

      // Add plant_quantity column (JSON array)
      await queryInterface.addColumn('tbl_child', 'plant_quantity', {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'पौधे की मात्रा (अधिकतम 5 पौधे)'
      });
      console.log('✅ Added plant_quantity column');

      // Add mmjy column (Mukhyamantri Jeevan Janani Yojna)
      await queryInterface.addColumn('tbl_child', 'mmjy', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'मुख्यमंत्री जीवन जननी योजना (हां/नहीं)'
      });
      console.log('✅ Added mmjy column');

      // Add pmmvy column (Pradhan Mantri Matru Vandana Yojna)
      await queryInterface.addColumn('tbl_child', 'pmmvy', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'प्रधानमंत्री मातृ वंदना योजना (हां/नहीं)'
      });
      console.log('✅ Added pmmvy column');

      console.log('🎉 Successfully added all new mother registration fields');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Removing new mother registration fields from Child table...');
    
    try {
      await queryInterface.removeColumn('tbl_child', 'delivery_time');
      await queryInterface.removeColumn('tbl_child', 'child_order');
      await queryInterface.removeColumn('tbl_child', 'plant_quantity');
      await queryInterface.removeColumn('tbl_child', 'mmjy');
      await queryInterface.removeColumn('tbl_child', 'pmmvy');
      
      console.log('✅ Successfully removed all new mother registration fields');
      
    } catch (error) {
      console.error('❌ Rollback migration failed:', error);
      throw error;
    }
  }
};
