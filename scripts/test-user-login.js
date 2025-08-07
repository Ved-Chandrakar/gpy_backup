/**
 * Test User Login
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');

const testUserLogin = async () => {
  try {
    console.log('🔐 Testing User Login...\n');

    // Test different types of users
    const testUsers = [
      { userid: 'CG-STATE-001', type: 'State' },
      { userid: 'CG-DIST-3322', type: 'District' },
      { userid: 'CG-CHC-3322-001', type: 'Hospital' }
    ];

    const testPassword = 'gpy@2025';

    for (const testUser of testUsers) {
      console.log(`🧪 Testing ${testUser.type} User: ${testUser.userid}`);
      
      // Find user
      const user = await User.findOne({ where: { userid: testUser.userid } });
      
      if (!user) {
        console.log(`❌ User ${testUser.userid} not found`);
        continue;
      }

      console.log(`✅ User found: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Mobile: ${user.mobile}`);
      console.log(`   Role ID: ${user.role_id}`);
      console.log(`   District ID: ${user.district_id || 'None'}`);
      console.log(`   Hospital ID: ${user.hospital_id || 'None'}`);
      console.log(`   Is Active: ${user.is_active}`);

      // Test password
      const isPasswordValid = await user.checkPassword(testPassword);
      console.log(`🔑 Password test: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      console.log('─'.repeat(60));
    }

    // Test invalid login
    console.log('\n🧪 Testing Invalid Login:');
    const user = await User.findOne({ where: { userid: 'CG-STATE-001' } });
    const invalidPassword = await user.checkPassword('wrongpassword');
    console.log(`🔑 Wrong password test: ${invalidPassword ? '❌ UNEXPECTEDLY VALID' : '✅ CORRECTLY INVALID'}`);

    console.log('\n🎉 Login testing completed!');

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

testUserLogin();
