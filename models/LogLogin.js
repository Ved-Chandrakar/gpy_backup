const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogLogin = sequelize.define('LogLogin', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
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
    comment: 'User ID who logged in'
  },
  user_agent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Browser/client user agent string'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the login (supports IPv4 and IPv6)'
  },
  mac_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'MAC address of the device'
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Device information in JSON format (OS, browser, etc.)'
  },
  token: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'Authentication token used for this session'
  },
  login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Login timestamp'
  },
  logout_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Logout timestamp'
  }
}, {
  tableName: 'log_login',
  timestamps: false, // We're using custom timestamps
  indexes: [
    {
      name: 'idx_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_login_at',
      fields: ['login_at']
    },
    {
      name: 'idx_ip_address',
      fields: ['ip_address']
    }
  ]
});

module.exports = LogLogin;
