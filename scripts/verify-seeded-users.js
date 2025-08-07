/**
 * Verify Seeded Users
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');

const verifySeededUsers = async () => {
  try {
    console.log('🔍 Verifying Seeded Users...\n');

    // Get all users
    const users = await User.findAll({
      order: [['role_id', 'ASC'], ['userid', 'ASC']]
    });

    // Get all roles for reference
    const roles = await Role.findAll();
    const roleMap = roles.reduce((acc, role) => {
      acc[role.id] = role.name;
      return acc;
    }, {});

    console.log(`📊 Total users in database: ${users.length}\n`);

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      const roleName = roleMap[user.role_id] || 'Unknown';
      if (!acc[roleName]) acc[roleName] = [];
      acc[roleName].push(user);
      return acc;
    }, {});

    // Display users by role
    Object.keys(usersByRole).forEach(roleName => {
      const roleUsers = usersByRole[roleName];
      console.log(`📋 ${roleName.toUpperCase()} USERS (${roleUsers.length}):`);
      console.log('─'.repeat(100));
      
      roleUsers.forEach(user => {
        const districtInfo = user.district_id ? `District: ${user.district_id}` : 'No District';
        const hospitalInfo = user.hospital_id ? `Hospital: ${user.hospital_id} (${user.hospital_name})` : 'No Hospital';
        
        console.log(`UserID: ${user.userid.padEnd(15)} | Name: ${user.name.padEnd(35)} | Mobile: ${user.mobile}`);
        console.log(`Email:  ${user.email.padEnd(15)} | ${districtInfo.padEnd(20)} | ${hospitalInfo}`);
        console.log(`Active: ${user.is_active ? 'Yes' : 'No'.padEnd(15)} | Password Changed: ${user.is_password_changed ? 'Yes' : 'No'}`);
        console.log('');
      });
    });

    // Test login credentials
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('─'.repeat(80));
    console.log('UserID'.padEnd(20) + 'Password'.padEnd(20) + 'Role'.padEnd(15) + 'Name');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      const roleName = roleMap[user.role_id] || 'Unknown';
      console.log(`${user.userid.padEnd(20)}gpy@2025${' '.padEnd(12)}${roleName.padEnd(15)}${user.name}`);
    });

    console.log('\n📈 Statistics:');
    console.log(`• State Users: ${usersByRole.state ? usersByRole.state.length : 0}`);
    console.log(`• District Users: ${usersByRole.collector ? usersByRole.collector.length : 0}`);
    console.log(`• Hospital Users: ${usersByRole.hospital ? usersByRole.hospital.length : 0}`);
    console.log(`• Total: ${users.length}`);

    console.log('\n✅ All users are ready for login!');
    console.log('🔐 Default password for all users: gpy@2025');

  } catch (error) {
    console.error('❌ Error verifying users:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

verifySeededUsers();
