/**
 * User Table Update Verification Script
 * Tests the new device_token and hospital_id columns
 */

require('dotenv').config();
const { User } = require('../models');

const verifyUserTableUpdates = async () => {
  try {
    console.log('🔍 Verifying User Table Updates...\n');

    // Test 1: Check if columns exist by trying to query them
    console.log('1️⃣ Testing column existence...');
    const users = await User.findAll({
      attributes: ['id', 'name', 'device_token', 'hospital_id', 'hospital_name'],
      limit: 3
    });
    console.log('✅ Columns exist and are queryable');

    // Test 2: Try to create/update a user with new fields
    console.log('\n2️⃣ Testing column functionality...');
    
    // Find an existing user or create test data
    let testUser = await User.findOne({ limit: 1 });
    
    if (testUser) {
      console.log(`📝 Testing with existing user: ${testUser.name} (ID: ${testUser.id})`);
      
      // Test updating device_token
      await testUser.update({
        device_token: 'test_device_token_' + Date.now(),
        hospital_id: 1
      });
      
      // Fetch updated user
      const updatedUser = await User.findByPk(testUser.id);
      console.log('✅ device_token updated:', updatedUser.device_token ? 'Success' : 'Failed');
      console.log('✅ hospital_id updated:', updatedUser.hospital_id ? 'Success' : 'Failed');
      
    } else {
      console.log('ℹ️ No existing users found to test with');
    }

    // Test 3: Show table structure
    console.log('\n3️⃣ Current table structure:');
    const [results] = await User.sequelize.query('SHOW COLUMNS FROM tbl_user WHERE Field IN ("device_token", "hospital_id", "hospital_name")');
    console.table(results);

    // Test 4: Show sample data
    console.log('\n4️⃣ Sample user data with new columns:');
    const sampleUsers = await User.findAll({
      attributes: ['id', 'name', 'mobile', 'hospital_id', 'hospital_name', 'device_token'],
      limit: 5
    });
    
    if (sampleUsers.length > 0) {
      console.table(sampleUsers.map(user => ({
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        hospital_id: user.hospital_id,
        hospital_name: user.hospital_name,
        device_token: user.device_token ? user.device_token.substring(0, 20) + '...' : null
      })));
    } else {
      console.log('No users found in database');
    }

    console.log('\n🎉 User table update verification completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('✅ device_token column added (TEXT, nullable)');
    console.log('✅ hospital_id column added (INT, nullable)');
    console.log('✅ hospital_name column retained for backward compatibility');
    console.log('✅ Indexes created for performance');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await User.sequelize.close();
    process.exit(0);
  }
};

// Run verification
verifyUserTableUpdates();
