const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlantPhoto = sequelize.define('PlantPhoto', {
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
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'फोटो का पथ'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'अक्षांश'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'देशांतर'
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'अपलोड तिथि'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'अपलोडकर्ता'
  },
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'पौधे निर्धारण के बाद का सप्ताह संख्या'
  },
  growth_stage: {
    type: DataTypes.ENUM('seedling', 'sapling', 'young', 'mature'),
    allowNull: false,
    defaultValue: 'seedling',
    comment: 'विकास चरण'
  },
  health_status: {
    type: DataTypes.ENUM('healthy', 'moderate', 'poor', 'dead'),
    allowNull: false,
    defaultValue: 'healthy',
    comment: 'स्वास्थ्य स्थिति'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'टिप्पणी'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'सत्यापित'
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'सत्यापनकर्ता मितानिन आईडी'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'सत्यापन तिथि'
  }
}, {
  tableName: 'log_plant_photo',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PlantPhoto;
