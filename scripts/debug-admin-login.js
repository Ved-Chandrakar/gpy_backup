const { User, Role } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

async function debugAdminLogin() {
  try {
    console.log('🔍 Debugging Admin Login Process...');
    
    const testCredentials = {
      mobile: 'CGSTATE001',
      password: 'gpy@2025'
    };
    
    console.log(`\n1. Testing credentials: ${testCredentials.mobile} / ${testCredentials.password}`);
    
    // Step 1: Find user
    console.log('\n2. Searching for user...');
    const user = await User.findOne({
      where: { 
        [Op.or]: [
          { mobile: testCredentials.mobile },
          { userid: testCredentials.mobile }
        ],
        is_active: true 
      },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });
    
    if (!user) {
      console.log('   ❌ User not found');
      return;
    }
    
    console.log('   ✅ User found:');
    console.log(`      ID: ${user.id}`);
    console.log(`      UserID: ${user.userid}`);
    console.log(`      Name: ${user.name}`);
    console.log(`      Mobile: ${user.mobile}`);
    console.log(`      Role: ${user.role?.name}`);
    console.log(`      Active: ${user.is_active}`);
    console.log(`      Password Hash: ${user.password ? 'Present' : 'Missing'}`);
    
    // Step 2: Check role
    console.log('\n3. Checking role permissions...');
    const allowedRoles = ['admin', 'manager', 'state', 'hospital'];
    const roleAllowed = allowedRoles.includes(user.role.name);
    console.log(`   Role "${user.role.name}" allowed: ${roleAllowed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Allowed roles: ${allowedRoles.join(', ')}`);
    
    if (!roleAllowed) {
      console.log('   ❌ Role not allowed for admin panel');
      return;
    }
    
    // Step 3: Check password
    console.log('\n4. Checking password...');
    try {
      // Check if user has the checkPassword method
      if (typeof user.checkPassword === 'function') {
        console.log('   Using user.checkPassword() method...');
        const isMatch = await user.checkPassword(testCredentials.password);
        console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log('   checkPassword method not available, using bcrypt directly...');
        const isMatch = await bcrypt.compare(testCredentials.password, user.password);
        console.log(`   Password match (bcrypt): ${isMatch ? '✅ YES' : '❌ NO'}`);
      }
    } catch (error) {
      console.log(`   ❌ Password check error: ${error.message}`);
    }
    
    // Step 4: Check if JWT_SECRET is set
    console.log('\n5. Checking environment...');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugAdminLogin();
