const { User, Role } = require('../models');

const checkHospitalUsers = async () => {
  try {
    console.log('🏥 Checking hospital users in database...');
    
    // Get all users with hospital role
    const hospitalUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'role',
        where: { name: 'hospital' }
      }],
      attributes: ['id', 'userid', 'name', 'mobile', 'is_active'],
      order: [['id', 'ASC']]
    });

    if (hospitalUsers.length === 0) {
      console.log('❌ No hospital users found in database');
      return;
    }

    console.log(`✅ Found ${hospitalUsers.length} hospital users:`);
    console.log('┌────┬─────────────┬──────────────────────┬──────────────┬─────────┐');
    console.log('│ ID │   User ID   │        Name          │    Mobile    │ Active  │');
    console.log('├────┼─────────────┼──────────────────────┼──────────────┼─────────┤');
    
    hospitalUsers.forEach(user => {
      const id = user.id.toString().padEnd(2);
      const userid = (user.userid || 'N/A').padEnd(11);
      const name = (user.name || 'N/A').padEnd(20).substring(0, 20);
      const mobile = (user.mobile || 'N/A').padEnd(12);
      const active = (user.is_active ? 'Yes' : 'No').padEnd(7);
      
      console.log(`│ ${id} │ ${userid} │ ${name} │ ${mobile} │ ${active} │`);
    });
    
    console.log('└────┴─────────────┴──────────────────────┴──────────────┴─────────┘');
    
    // Show password info for first user
    if (hospitalUsers.length > 0) {
      const firstUser = await User.findByPk(hospitalUsers[0].id, {
        attributes: ['userid', 'password']
      });
      
      console.log('\n💡 For testing, try these credentials:');
      console.log(`   User ID: ${firstUser.userid}`);
      console.log(`   Password: password123 (or check if it\'s hashed)`);
    }

  } catch (error) {
    console.error('❌ Error checking hospital users:', error.message);
  }
};

checkHospitalUsers().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
