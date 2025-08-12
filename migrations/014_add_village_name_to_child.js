module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_child', 'village_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'गाँव का नाम'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_child', 'village_name');
  }
};
