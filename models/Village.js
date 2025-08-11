const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Village = sequelize.define('Village', {
  village_code: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    comment: 'Primary village code'
  },
  village_lgd_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'LGD village code'
  },
  village_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the village'
  },
  panchayat_code: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Panchayat code'
  },
  panchayat_lgd_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
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
  block_lgd_code: {
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
  district_lgd_code: {
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
  tableName: 'master_village',
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'master_village_mappings_pk',
      fields: ['village_code', 'panchayat_code', 'block_code', 'district_code']
    }
  ]
});

module.exports = Village;
