const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Child = sequelize.define('Child', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mother_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'माँ का नाम'
  },
  father_husband_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'पिता/पति का नाम'
  },
  mother_mobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'माँ का मोबाइल नंबर'
  },
  mother_aadhar: {
    type: DataTypes.STRING(12),
    allowNull: true,
    comment: 'माँ का आधार नंबर'
  },
  delivery_type: {
    type: DataTypes.ENUM('normal', 'cesarean', 'assisted'),
    allowNull: true,
    comment: 'प्रसव का प्रकार'
  },
  blood_group: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true,
    comment: 'रक्त समूह'
  },
  child_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'बच्चे का नाम'
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'जन्म तिथि'
  },
  delivery_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'प्रसव का समय'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false,
    comment: 'लिंग'
  },
  child_order: {
    type: DataTypes.ENUM('first', 'second', 'third', 'fourth'),
    allowNull: true,
    comment: 'बच्चे का क्रम (पहला, दूसरा, तीसरा, चौथा)'
  },
  plant_quantity: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'पौधे की मात्रा (कुल मात्रा अधिकतम 5)',
    validate: {
      isValidPlants(value) {
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            throw new Error('Plants must be an array');
          }
          
          // Validate each item is an object with plant_id, quantity, and optional status
          for (const item of value) {
            if (typeof item !== 'object' || item === null) {
              throw new Error('Each plant item must be an object');
            }
            if (!item.hasOwnProperty('plant_id') || !item.hasOwnProperty('quantity')) {
              throw new Error('Each plant item must have plant_id and quantity properties');
            }
            if (typeof item.plant_id !== 'number' || item.plant_id <= 0) {
              throw new Error('Plant ID must be a positive number');
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
              throw new Error('Quantity must be a positive number');
            }
            // Validate status if provided
            if (item.status && !['good', 'dead', 'pending'].includes(item.status)) {
              throw new Error('Status must be one of: good, dead, pending');
            }
          }
          
          // Calculate total quantity
          const totalQuantity = value.reduce((sum, item) => sum + item.quantity, 0);
          if (totalQuantity > 5) {
            throw new Error('Total plant quantity cannot exceed 5');
          }
          
          // Check for duplicate plant_ids
          const plantIds = value.map(item => item.plant_id);
          const uniquePlantIds = new Set(plantIds);
          if (plantIds.length !== uniquePlantIds.size) {
            throw new Error('Duplicate plant IDs are not allowed');
          }
        }
      }
    }
  },
  mmjy: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'मुख्यमंत्री जीवन जननी योजना (हां/नहीं)'
  },
  pmmvy: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'प्रधानमंत्री मातृ वंदना योजना (हां/नहीं)'
  },
  birth_certificate: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'क्या birth certificate मिला? (हां/नहीं)'
  },
  is_shramik_card: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'क्या श्रमिक कार्ड बना हुआ है? (हां/नहीं)'
  },
  is_used_ayushman_card: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'क्या इस delivery के लिए आयुष्मान कार्ड का प्रयोग हुआ? (हां/नहीं)'
  },
  ayushman_card_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'आयुष्मान कार्ड की राशि (यदि उपयोग हुआ हो)'
  },
  is_benefit_nsy: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'क्या वो नन्नी सुरक्षा योजना के अंतर्गत आती है? (केवल बालिका के लिए)'
  },
  is_nsy_form: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: 'NSY फॉर्म मिला है? (केवल बालिका के लिए)'
  },
  weight_at_birth: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'जन्म के समय वजन'
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'अस्पताल आईडी'
  },
  district_code: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    references: {
      model: 'master_district',
      key: 'district_code'
    },
    comment: 'जिला कोड'
  },
  block_code: {
    type: DataTypes.MEDIUMINT,
    allowNull: true,
    references: {
      model: 'master_block',
      key: 'block_code'
    },
    comment: 'ब्लॉक कोड'
  },
  village_code: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'master_village',
      key: 'village_code'
    },
    comment: 'गाँव कोड'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'पता'
  },
  assigned_mitanin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_user',
      key: 'id'
    },
    comment: 'निर्धारित मितानिन आईडी'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'सक्रिय स्थिति'
  }
}, {
  tableName: 'tbl_child',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Child;
