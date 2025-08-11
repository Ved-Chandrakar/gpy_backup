const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Panchayat = sequelize.define('Panchayat', {
  panchayat_code: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    comment: 'Primary panchayat code'
  },
  lgd_panchayat_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    unique: true,
    comment: 'LGD panchayat code'
  },
  panchayat_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the panchayat'
  },
  block_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Block code'
  },
  lgd_block_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'LGD block code'
  },
  block_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the block'
  },
  district_code: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    comment: 'District code'
  },
  lgd_district_code: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    comment: 'LGD district code'
  },
  district_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the district'
  }
}, {
  tableName: 'master_panchayat',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['lgd_panchayat_code']
    }
  ]
});

module.exports = Panchayat;
