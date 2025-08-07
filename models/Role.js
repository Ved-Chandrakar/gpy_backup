const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'भूमिका का नाम'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'अनुमतियाँ'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'भूमिका का विवरण'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'सक्रिय स्थिति'
  }
}, {
  tableName: 'master_role',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Role;
