const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * FCM Token model for storing user device tokens
 */
const FCMToken = sequelize.define('FCMToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'उपयोगकर्ता आईडी'
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    comment: 'FCM Token'
  },
  device_type: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false,
    defaultValue: 'android',
    comment: 'डिवाइस प्रकार'
  },
  device_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'डिवाइस आईडी'
  },
  app_version: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'ऐप संस्करण'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'सक्रिय स्थिति'
  },
  last_used: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'अंतिम उपयोग'
  }
}, {
  tableName: 'tbl_fcm_token',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = FCMToken;
