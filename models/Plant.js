const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Plant = sequelize.define('Plant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'पौधे का नाम'
  },
  species: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'पौधे की प्रजाति'
  },
  category: {
    type: DataTypes.ENUM('medicinal', 'fruit', 'flower', 'timber', 'other'),
    allowNull: false,
    comment: 'पौधे की श्रेणी'
  },
  local_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'स्थानीय नाम'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'पौधे का विवरण'
  },
  care_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'देखभाल की निर्देश'
  },
  growth_period_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 12,
    comment: 'वृद्धि अवधि (महीने)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'सक्रिय स्थिति'
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Plant image URL path'
  }
}, {
  tableName: 'master_plant',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Plant;
