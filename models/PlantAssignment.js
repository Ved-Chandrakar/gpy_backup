const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlantAssignment = sequelize.define('PlantAssignment', {
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
  plant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'master_plant',
      key: 'id'
    },
    comment: 'पौधे की आईडी'
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'निर्धारण तिथि'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'replaced', 'dead'),
    allowNull: false,
    defaultValue: 'active',
    comment: 'पौधे की स्थिति'
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'निर्धारणकर्ता'
  },
  completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'पूर्णता तिथि'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'टिप्पणी'
  }
}, {
  tableName: 'tbl_plant_assignment',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PlantAssignment;
