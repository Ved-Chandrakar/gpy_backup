const { sequelize } = require('../config/database');

// Import all models
const Role = require('./Role');
const District = require('./District');
const Block = require('./Block');
const Panchayat = require('./Panchayat');
const Village = require('./Village');
const AWC = require('./AWC');
const User = require('./User');
const Child = require('./Child');
const Plant = require('./Plant');
const PlantAssignment = require('./PlantAssignment');
const PlantPhoto = require('./PlantPhoto');
const PlantTrackingSchedule = require('./PlantTrackingSchedule');
const ReplacementRequest = require('./ReplacementRequest');
const FCMToken = require('./FCMToken');
const LogLogin = require('./LogLogin');

// Define associations
const defineAssociations = () => {
  // Role associations
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

  // Location associations - Updated for new structure
  // Note: Associations are simplified due to composite keys in the new structure
  // For complex queries, direct SQL joins may be more appropriate
  
  // District associations
  District.hasMany(Block, { foreignKey: 'district_code', sourceKey: 'district_code', as: 'blocks' });
  Block.belongsTo(District, { foreignKey: 'district_code', targetKey: 'district_code', as: 'district' });

  // Block associations  
  Block.hasMany(Panchayat, { foreignKey: 'block_code', sourceKey: 'block_code', as: 'panchayats' });
  Panchayat.belongsTo(Block, { foreignKey: 'block_code', targetKey: 'block_code', as: 'block' });

  // Panchayat associations
  Panchayat.hasMany(Village, { foreignKey: 'panchayat_code', sourceKey: 'panchayat_code', as: 'villages' });
  Village.belongsTo(Panchayat, { foreignKey: 'panchayat_code', targetKey: 'panchayat_code', as: 'panchayat' });

  // Child associations
  Child.belongsTo(User, { foreignKey: 'hospital_id', as: 'hospital' });
  Child.belongsTo(User, { foreignKey: 'assigned_mitanin_id', as: 'mitanin' });
  Child.belongsTo(District, { foreignKey: 'district_code', targetKey: 'district_code', as: 'district' });
  Child.belongsTo(Block, { foreignKey: 'block_code', targetKey: 'block_code', as: 'block' });
  Child.belongsTo(Village, { foreignKey: 'village_code', targetKey: 'village_code', as: 'village' });

  // Reverse associations for location models
  District.hasMany(Child, { foreignKey: 'district_code', sourceKey: 'district_code', as: 'children' });
  Block.hasMany(Child, { foreignKey: 'block_code', sourceKey: 'block_code', as: 'children' });
  Village.hasMany(Child, { foreignKey: 'village_code', sourceKey: 'village_code', as: 'children' });

  // Plant assignment associations
  PlantAssignment.belongsTo(Child, { foreignKey: 'child_id', as: 'child' });
  PlantAssignment.belongsTo(Plant, { foreignKey: 'plant_id', as: 'plant' });
  PlantAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy' });

  Child.hasMany(PlantAssignment, { foreignKey: 'child_id', as: 'plantAssignments' });
  Plant.hasMany(PlantAssignment, { foreignKey: 'plant_id', as: 'assignments' });

  // Plant photo associations
  PlantPhoto.belongsTo(PlantAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
  PlantPhoto.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploadedBy' });

  PlantAssignment.hasMany(PlantPhoto, { foreignKey: 'assignment_id', as: 'photos' });

  // Plant tracking schedule associations
  PlantTrackingSchedule.belongsTo(PlantAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
  PlantTrackingSchedule.belongsTo(PlantPhoto, { foreignKey: 'photo_id', as: 'photo' });
  
  PlantAssignment.hasMany(PlantTrackingSchedule, { foreignKey: 'assignment_id', as: 'trackingSchedules' });
  PlantPhoto.hasOne(PlantTrackingSchedule, { foreignKey: 'photo_id', as: 'trackingSchedule' });

  // Replacement request associations
  ReplacementRequest.belongsTo(PlantAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
  ReplacementRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requestedBy' });
  ReplacementRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewedBy' });

  // FCM Token associations
  FCMToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(FCMToken, { foreignKey: 'user_id', as: 'fcmTokens' });

  // Login Log associations
  LogLogin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(LogLogin, { foreignKey: 'user_id', as: 'loginLogs' });
};

// Initialize associations
defineAssociations();

// डेटाबेस सिंक करें
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ डेटाबेस सफलतापूर्वक सिंक्रोनाइज़ हुआ।');
  } catch (error) {
    console.error('❌ डेटाबेस सिंक्रोनाइज़ेशन असफल:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Role,
  District,
  Block,
  Panchayat,
  Village,
  AWC,
  User,
  Child,
  Plant,
  PlantAssignment,
  PlantPhoto,
  PlantTrackingSchedule,
  ReplacementRequest,
  FCMToken,
  LogLogin,
  syncDatabase
};
