const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add verified_by column
    await queryInterface.addColumn('log_plant_photo', 'verified_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_user',
        key: 'id'
      },
      comment: 'सत्यापनकर्ता मितानिन आईडी'
    });

    // Add verified_at column
    await queryInterface.addColumn('log_plant_photo', 'verified_at', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'सत्यापन तिथि'
    });

    console.log('✅ Added verified_by and verified_at columns to log_plant_photo table');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove verified_at column
    await queryInterface.removeColumn('log_plant_photo', 'verified_at');
    
    // Remove verified_by column
    await queryInterface.removeColumn('log_plant_photo', 'verified_by');

    console.log('✅ Removed verified_by and verified_at columns from log_plant_photo table');
  }
};
