const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MotherPhoto = sequelize.define('MotherPhoto', {
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
    comment: 'बच्चे की आईडी'
  },
  photo_type: {
    type: DataTypes.ENUM('mother_with_child', 'prescription', 'certificate', 'plant_distribution'),
    allowNull: false,
    comment: 'फोटो का प्रकार (प्रमाण पत्र या पौधा वितरण फोटो)'
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
    defaultValue: DataTypes.NOW,
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
  }
}, {
  tableName: 'tbl_mother_photos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['child_id']
    },
    {
      fields: ['photo_type']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['upload_date']
    }
  ]
});

module.exports = MotherPhoto;
