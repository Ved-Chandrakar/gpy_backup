const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function setupTestMitanin() {
  try {
    console.log('=== Setting up Test Mitanin User ===\n');

    // 1. Find the mitanin role
    const mitaninRole = await Role.findOne({ where: { name: 'mitanin' } });
    if (!mitaninRole) {
      console.error('❌ Mitanin role not found in database');
      console.log('Please ensure the mitanin role exists in the roles table');
      return;
    }
    console.log('✅ Found mitanin role:', mitaninRole.name, '(ID:', mitaninRole.id + ')');

    // 2. Check if test mitanin already exists
    const existingMitanin = await User.findOne({ where: { userid: 'mitanin001' } });
    if (existingMitanin) {
      console.log('ℹ️ Test mitanin user already exists');
      console.log('   User ID:', existingMitanin.id);
      console.log('   Name:', existingMitanin.name);
      console.log('   Hospital ID:', existingMitanin.hospital_id);
      console.log('   Is Active:', existingMitanin.is_active);
      return existingMitanin;
    }

    // 3. Find a hospital to assign the mitanin to
    // For test purposes, we'll use hospital_id = 1 or the first available hospital
    let hospitalId = 1;
    
    // Check if there are any existing users with hospital_id to use the same
    const hospitalUser = await User.findOne({ 
      where: { hospital_id: { [require('sequelize').Op.not]: null } },
      order: [['id', 'ASC']]
    });
    
    if (hospitalUser && hospitalUser.hospital_id) {
      hospitalId = hospitalUser.hospital_id;
      console.log('✅ Using existing hospital ID:', hospitalId);
    } else {
      console.log('⚠️ Using default hospital ID:', hospitalId);
    }

    // 4. Create the test mitanin user
    // Note: User model has beforeCreate hook that automatically hashes password
    
    const testMitanin = await User.create({
      userid: 'mitanin001',
      password: 'gpy@2025', // Will be hashed by beforeCreate hook
      name: 'मितानिन टेस्ट उपयोगकर्ता',
      mobile: '9876543001', // Test mobile number for mitanin
      email: 'mitanin001@test.com',
      role_id: mitaninRole.id,
      hospital_id: hospitalId,
      is_active: true,
      is_password_changed: 0
    });

    console.log('✅ Test mitanin user created successfully!');
    console.log('   User ID:', testMitanin.id);
    console.log('   Username:', testMitanin.userid);
    console.log('   Password:', 'gpy@2025');
    console.log('   Name:', testMitanin.name);
    console.log('   Role ID:', testMitanin.role_id);
    console.log('   Hospital ID:', testMitanin.hospital_id);

    // 5. Verify the user can be found with role
    const verifyUser = await User.findOne({
      where: { userid: 'mitanin001' },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (verifyUser) {
      console.log('✅ User verification successful');
      console.log('   Role:', verifyUser.role.name);
      console.log('   Permissions:', verifyUser.role.permissions);
    }

    console.log('\n=== Mitanin User Setup Complete ===');
    console.log('You can now use these credentials to test mitanin APIs:');
    console.log('- userId: mitanin001');
    console.log('- password: gpy@2025');
    console.log('- loginType: mitanin');

    return testMitanin;

  } catch (error) {
    console.error('❌ Error setting up test mitanin user:', error.message);
    if (error.name === 'SequelizeValidationError') {
      error.errors.forEach(err => {
        console.error('   Validation error:', err.path, '-', err.message);
      });
    }
    throw error;
  }
}

// Run the setup
setupTestMitanin()
  .then(() => {
    console.log('\nSetup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nSetup failed:', error.message);
    process.exit(1);
  });
