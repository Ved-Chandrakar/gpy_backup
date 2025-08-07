const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const District = sequelize.define('District', {
  district_code: {
    type: DataTypes.SMALLINT,
    primaryKey: true,
    allowNull: false,
    comment: 'Primary district code'
  },
  lgd_district_code: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    unique: true,
    comment: 'LGD district code'
  },
  district_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name of the district'
  }
}, {
  tableName: 'master_district',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['lgd_district_code']
    }
  ]
});

module.exports = District;
