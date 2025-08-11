const { User, Role } = require('../models');

async function fixMitaninUser() {
  try {
    console.log('=== Fixing Mitanin User Password ===\n');

    // 1. Delete existing user
    const deleted = await User.destroy({ where: { userid: 'mitanin001' } });
    console.log('✅ Deleted existing user:', deleted > 0 ? 'Success' : 'No user found');

    // 2. Find mitanin role
    const mitaninRole = await Role.findOne({ where: { name: 'mitanin' } });
    console.log('✅ Found mitanin role:', mitaninRole.name);

    // 3. Create new user (let Sequelize handle password hashing)
    const testMitanin = await User.create({
      userid: 'mitanin001',
      password: 'mitanin001', // Let the beforeCreate hook handle hashing
      name: 'मितानिन टेस्ट उपयोगकर्ता',
      mobile: '9876543001',
      email: 'mitanin001@test.com',
      role_id: mitaninRole.id,
      hospital_id: 19,
      is_active: true,
      is_password_changed: 0
    });

    console.log('✅ New mitanin user created with ID:', testMitanin.id);

    // 4. Test the password immediately
    const user = await User.findOne({ where: { userid: 'mitanin001' } });
    const passwordTest = await user.checkPassword('mitanin001');
    console.log('✅ Password test result:', passwordTest ? 'SUCCESS' : 'FAILED');

    if (passwordTest) {
      console.log('\n✅ User is ready for testing!');
      console.log('Credentials:');
      console.log('- userId: mitanin001');
      console.log('- password: mitanin001');
      console.log('- loginType: mitanin');
    } else {
      console.log('\n❌ Password still not working. Manual fix needed.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'SequelizeValidationError') {
      error.errors.forEach(err => {
        console.error('   Validation error:', err.path, '-', err.message);
      });
    }
  }
}

fixMitaninUser();
