const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function checkHospitalLogin() {
  try {
    console.log('🔍 Checking hospital login credentials...');
    
    // Find hospital user
    const hospitalUser = await User.findOne({
      where: { userid: 'CGSTATE001' },
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    if (hospitalUser) {
      console.log('✅ Found hospital user:');
      console.log(`   ID: ${hospitalUser.id}`);
      console.log(`   UserID: ${hospitalUser.userid}`);
      console.log(`   Name: ${hospitalUser.name}`);
      console.log(`   Role: ${hospitalUser.role?.name}`);
      console.log(`   Hospital ID: ${hospitalUser.hospital_id}`);
      console.log(`   Is Active: ${hospitalUser.is_active}`);
      console.log(`   Password Hash: ${hospitalUser.password ? 'Present' : 'Missing'}`);
      
      // Test password verification
      console.log('\n=== Testing Password Verification ===');
      const passwords = ['gpy@2025', 'CGSTATE001', 'admin123', 'hospital123'];
      
      for (const pwd of passwords) {
        try {
          const isMatch = await bcrypt.compare(pwd, hospitalUser.password);
          console.log(`Password "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        } catch (error) {
          console.log(`Password "${pwd}": ❌ ERROR - ${error.message}`);
        }
      }
      
      // Test with direct bcrypt
      console.log('\n=== Testing Bcrypt Directly ===');
      for (const pwd of passwords) {
        try {
          const isMatch = bcrypt.compareSync(pwd, hospitalUser.password);
          console.log(`Bcrypt "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        } catch (error) {
          console.log(`Bcrypt "${pwd}": ❌ ERROR - ${error.message}`);
        }
      }
      
      console.log('\n=== Current Hash Info ===');
      console.log(`Hash: ${hospitalUser.password.substring(0, 50)}${hospitalUser.password.length > 50 ? '...' : ''}`);
      console.log(`Hash length: ${hospitalUser.password.length}`);
      console.log(`Starts with $2a$ or $2b$: ${hospitalUser.password.startsWith('$2a$') || hospitalUser.password.startsWith('$2b$')}`);
      
    } else {
      console.log('❌ Hospital user CGSTATE001 not found');
      
      // Let's check what hospital users exist
      console.log('\n🔍 Checking existing hospital users...');
      const hospitalUsers = await User.findAll({
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'hospital' }
        }],
        limit: 10
      });
      
      console.log(`Found ${hospitalUsers.length} hospital users:`);
      hospitalUsers.forEach(user => {
        console.log(`   ID: ${user.id}, UserID: ${user.userid}, Name: ${user.name}, Active: ${user.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking hospital login:', error);
  }
}

checkHospitalLogin();
