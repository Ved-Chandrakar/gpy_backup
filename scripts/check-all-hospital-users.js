const { User, Role } = require('../models');

async function checkAllHospitalUsers() {
  try {
    console.log('🔍 Checking all hospital-level users...');
    
    const hospitalUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'role',
        where: { name: 'hospital' }
      }],
      where: { is_active: true }
    });
    
    console.log(`\n📋 Found ${hospitalUsers.length} active hospital users:`);
    hospitalUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Hospital User:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   UserID: ${user.userid}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Hospital ID: ${user.hospital_id}`);
      console.log(`   Hospital Name: ${user.hospital_name}`);
      console.log(`   Mobile: ${user.mobile}`);
      console.log(`   Active: ${user.is_active}`);
    });
    
    // Also check state users
    console.log('\n🔍 Checking state-level users...');
    const stateUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'role',
        where: { name: 'state' }
      }],
      where: { is_active: true }
    });
    
    console.log(`\n📋 Found ${stateUsers.length} active state users:`);
    stateUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. State User:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   UserID: ${user.userid}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role.name}`);
      console.log(`   Active: ${user.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkAllHospitalUsers();
