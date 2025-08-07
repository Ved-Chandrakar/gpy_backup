const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userid: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'यूजर आईडी'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'उपयोगकर्ता का नाम'
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    comment: 'मोबाइल नंबर'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'ईमेल पता'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'पासवर्ड'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'master_role',
      key: 'id'
    },
    comment: 'भूमिका आईडी'
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'master_district',
      key: 'id'
    },
    comment: 'जिला आईडी'
  },
  block_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'master_block',
      key: 'id'
    },
    comment: 'ब्लॉक आईडी'
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'master_hospital',
      key: 'id'
    },
    comment: 'अस्पताल आईडी'
  },
  hospital_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'अस्पताल का नाम (deprecated - use hospital_id)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'सक्रिय स्थिति'
  },
  is_password_changed: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    allowNull: false,
    comment: 'पासवर्ड बदला गया है (0 = नहीं, 1 = हाँ)'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'अंतिम लॉगिन'
  },
  device_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'डिवाइस टोकन (FCM/Push notifications के लिए)'
  }
}, {
  tableName: 'tbl_user',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Hash password before creating user
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hash password before updating user
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
