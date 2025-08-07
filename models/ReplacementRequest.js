const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReplacementRequest = sequelize.define('ReplacementRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_plant_assignment',
      key: 'id'
    },
    comment: 'पौधे निर्धारण आईडी'
  },
  reason: {
    type: DataTypes.ENUM('died', 'diseased', 'damaged', 'stolen', 'other'),
    allowNull: false,
    comment: 'बदलाव का कारण'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'विवरण'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'अनुरोध स्थिति'
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'अनुरोधकर्ता'
  },
  request_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'अनुरोध तिथि'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'समीक्षाकर्ता'
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'समीक्षा तिथि'
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'समीक्षा टिप्पणी'
  },
  new_assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_plant_assignment',
      key: 'id'
    },
    comment: 'नया निर्धारण आईडी'
  }
}, {
  tableName: 'tbl_replacement_request',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ReplacementRequest;
