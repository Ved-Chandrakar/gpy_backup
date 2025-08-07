const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function debugUser() {
  try {
    console.log('=== Debugging Mitanin User ===\n');

    // 1. Find the user in database
    const user = await User.findOne({
      where: { userid: 'mitanin001' },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   UserID:', user.userid);
    console.log('   Name:', user.name);
    console.log('   Mobile:', user.mobile);
    console.log('   Email:', user.email);
    console.log('   Role ID:', user.role_id);
    console.log('   Role Name:', user.role?.name);
    console.log('   Hospital ID:', user.hospital_id);
    console.log('   Is Active:', user.is_active);
    console.log('   Password Hash:', user.password.substring(0, 20) + '...');

    // 2. Test password verification
    console.log('\n--- Testing Password ---');
    const testPasswords = ['mitanin001', 'Mitanin001', '123456'];
    
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password "${testPassword}": ${isMatch ? '✅ Match' : '❌ No match'}`);
    }

    // 3. Test manual password creation and verification
    console.log('\n--- Manual Password Test ---');
    const newHash = await bcrypt.hash('mitanin001', 10);
    const manualCheck = await bcrypt.compare('mitanin001', newHash);
    console.log('   Manual hash/verify test:', manualCheck ? '✅ Success' : '❌ Failed');

    // 4. Check user.checkPassword method
    console.log('\n--- User Method Test ---');
    if (user.checkPassword) {
      const methodCheck = await user.checkPassword('mitanin001');
      console.log('   user.checkPassword test:', methodCheck ? '✅ Success' : '❌ Failed');
    } else {
      console.log('   ❌ checkPassword method not available');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugUser();
