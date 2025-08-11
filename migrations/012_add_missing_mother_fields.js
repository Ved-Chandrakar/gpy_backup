const { DataTypes } = require('sequelize');

/**
 * Migration to add missing fields to mother registration
 * - father_husband_name: Father/Husband's name
 * - delivery_type: Type of delivery (normal, cesarean, assisted)
 * - blood_group: Mother's blood group
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 Adding missing mother registration fields to tbl_child...');
    
    try {
      // Check if columns already exist
      const tableDescription = await queryInterface.describeTable('tbl_child');
      
      // Add father_husband_name field if it doesn't exist
      if (!tableDescription.father_husband_name) {
        await queryInterface.addColumn('tbl_child', 'father_husband_name', {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'पिता/पति का नाम'
        });
        console.log('✅ Added father_husband_name column');
      } else {
        console.log('⚠️ father_husband_name column already exists');
      }

      // Add delivery_type field if it doesn't exist
      if (!tableDescription.delivery_type) {
        await queryInterface.addColumn('tbl_child', 'delivery_type', {
          type: DataTypes.ENUM('normal', 'cesarean', 'assisted'),
          allowNull: true,
          comment: 'प्रसव का प्रकार'
        });
        console.log('✅ Added delivery_type column');
      } else {
        console.log('⚠️ delivery_type column already exists');
      }

      // Add blood_group field if it doesn't exist
      if (!tableDescription.blood_group) {
        await queryInterface.addColumn('tbl_child', 'blood_group', {
          type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
          allowNull: true,
          comment: 'रक्त समूह'
        });
        console.log('✅ Added blood_group column');
      } else {
        console.log('⚠️ blood_group column already exists');
      }

      console.log('🎉 Successfully added missing mother registration fields to tbl_child');
      
    } catch (error) {
      console.error('❌ Error adding missing mother registration fields:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing missing mother registration fields from tbl_child...');
    
    try {
      await queryInterface.removeColumn('tbl_child', 'father_husband_name');
      console.log('✅ Removed father_husband_name column');

      await queryInterface.removeColumn('tbl_child', 'delivery_type');
      console.log('✅ Removed delivery_type column');

      await queryInterface.removeColumn('tbl_child', 'blood_group');
      console.log('✅ Removed blood_group column');

      console.log('🎉 Successfully removed missing mother registration fields from tbl_child');
      
    } catch (error) {
      console.error('❌ Rollback migration failed:', error);
      throw error;
    }
  }
};
