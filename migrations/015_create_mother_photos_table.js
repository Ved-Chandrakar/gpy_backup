const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tbl_mother_photos', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      child_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_child',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'बच्चे की आईडी'
      },
      photo_type: {
        type: DataTypes.ENUM('mother_with_child', 'prescription'),
        allowNull: false,
        comment: 'फोटो का प्रकार (माँ-बच्चे की फोटो या प्रिस्क्रिप्शन)'
      },
      photo_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'फोटो का पाथ'
      },
      original_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'मूल फाइल का नाम'
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'फाइल का साइज़ (bytes में)'
      },
      uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        comment: 'अपलोड करने वाले यूजर की ID'
      },
      upload_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'अपलोड की तारीख'
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'वेरिफाई स्थिति'
      },
      verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        comment: 'वेरिफाई करने वाले की ID'
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'वेरिफाई करने की तारीख'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'टिप्पणी'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('tbl_mother_photos', ['child_id']);
    await queryInterface.addIndex('tbl_mother_photos', ['photo_type']);
    await queryInterface.addIndex('tbl_mother_photos', ['uploaded_by']);
    await queryInterface.addIndex('tbl_mother_photos', ['upload_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tbl_mother_photos');
  }
};
