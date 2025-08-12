module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_user', 'village', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'गाँव का नाम'
    });

    await queryInterface.addColumn('tbl_user', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'पूरा पता'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_user', 'village');
    await queryInterface.removeColumn('tbl_user', 'address');
  }
};
