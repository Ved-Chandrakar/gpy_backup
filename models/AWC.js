const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AWC = sequelize.define('AWC', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'AWC ID'
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'District name'
  },
  project_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Project code'
  },
  project: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Project name'
  },
  sector_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Sector code'
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Sector name'
  },
  awc_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'AWC name'
  },
  awc_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'AWC code'
  },
  district_lgd_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'District LGD code'
  },
  district_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'District code'
  },
  area: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Area type'
  },
  gp_nnn_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Gram Panchayat code'
  },
  gram_ward_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Gram ward code'
  },
  block: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Block name'
  },
  is_under_nny: {
    type: DataTypes.ENUM('Y', 'N'),
    allowNull: false,
    defaultValue: 'N',
    comment: 'Is under NNY scheme'
  },
  is_under_janman: {
    type: DataTypes.ENUM('Y', 'N'),
    allowNull: false,
    defaultValue: 'N',
    comment: 'Is under Janman scheme'
  },
  awc_belong: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'AWC belongs to'
  },
  awc_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'AWC type'
  },
  latitude: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Latitude coordinates'
  },
  longitude: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Longitude coordinates'
  },
  building_ownership: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Building ownership type'
  },
  building_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Building type'
  },
  toilet: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Toilet facility'
  }
}, {
  tableName: 'tbl_awc',
  timestamps: false
});

module.exports = AWC;
