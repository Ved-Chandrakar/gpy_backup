const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlantTrackingSchedule = sequelize.define('PlantTrackingSchedule', {
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
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'सप्ताह संख्या (1-12)'
  },
  month_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'महीना संख्या (1-3)'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'फोटो अपलोड की अंतिम तिथि'
  },
  upload_status: {
    type: DataTypes.ENUM('pending', 'completed', 'overdue'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'अपलोड स्थिति'
  },
  photo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'log_plant_photo',
      key: 'id'
    },
    comment: 'अपलोड की गई फोटो आईडी'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'पूर्ण होने की तिथि'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'टिप्पणी'
  }
}, {
  tableName: 'tbl_plant_tracking_schedule',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['assignment_id']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['upload_status']
    },
    {
      fields: ['assignment_id', 'week_number', 'month_number'],
      unique: true,
      name: 'unique_assignment_week_month'
    }
  ]
});

module.exports = PlantTrackingSchedule;
