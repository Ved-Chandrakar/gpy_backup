const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function debugMitaninUser() {
  try {
    console.log('=== Debugging Mitanin User ===\n');

    // 1. Find the mitanin user
    const mitanin = await User.findOne({
      where: { userid: 'mitanin001' },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!mitanin) {
      console.log('❌ Mitanin user not found');
      return;
    }

    console.log('✅ Found mitanin user:');
    console.log('   ID:', mitanin.id);
    console.log('   UserID:', mitanin.userid);
    console.log('   Name:', mitanin.name);
    console.log('   Role:', mitanin.role.name);
    console.log('   Hospital ID:', mitanin.hospital_id);
    console.log('   Is Active:', mitanin.is_active);
    console.log('   Password Hash:', mitanin.password ? 'Present' : 'Missing');

    // 2. Test password verification
    console.log('\n=== Testing Password Verification ===');
    
    const testPasswords = ['gpy@2025', 'mitanin001', 'mitanin123'];
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await mitanin.checkPassword(testPassword);
        console.log(`Password "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
      } catch (error) {
        console.log(`Password "${testPassword}":`, '❌ ERROR -', error.message);
      }
    }

    // 3. Test bcrypt directly
    console.log('\n=== Testing Bcrypt Directly ===');
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(testPassword, mitanin.password);
        console.log(`Bcrypt "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
      } catch (error) {
        console.log(`Bcrypt "${testPassword}":`, '❌ ERROR -', error.message);
      }
    }

    // 4. Show the current hash
    console.log('\n=== Current Hash Info ===');
    console.log('Hash:', mitanin.password);
    console.log('Hash length:', mitanin.password ? mitanin.password.length : 'N/A');
    console.log('Starts with $2a$ or $2b$:', mitanin.password ? mitanin.password.startsWith('$2') : 'N/A');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugMitaninUser();
