const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Block = sequelize.define('Block', {
  block_code: {
    type: DataTypes.MEDIUMINT,
    primaryKey: true,
    allowNull: false,
    comment: 'Primary block code'
  },
  lgd_block_code: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    unique: true,
    comment: 'LGD block code'
  },
  block_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name of the block'
  },
  district_code: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    comment: 'District code'
  },
  lgd_district_code: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    comment: 'LGD district code'
  }
}, {
  tableName: 'master_block',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['lgd_block_code']
    }
  ]
});

module.exports = Block;
