const db = require('../models');

async function findMotherUsers() {
  try {
    console.log('🔍 Looking for mother users (role_id = 5)...');
    const mothers = await db.User.findAll({ where: { role_id: 5 } });
    console.log(`Found ${mothers.length} mother users`);
    
    mothers.forEach((mother, index) => {
      console.log(`  ${index + 1}. ID: ${mother.id}, UserID: ${mother.userid}, Name: ${mother.name}`);
    });
    
    if (mothers.length === 0) {
      console.log('\n🔍 Checking all users with their roles...');
      const allUsers = await db.User.findAll({ limit: 10 });
      allUsers.forEach(user => {
        console.log(`  Role ${user.role_id}: ${user.name} (${user.userid})`);
      });
      
      console.log('\n📝 Note: In this system, mothers are represented as Child records');
      console.log('   Plants are assigned to children (which contain mother information)');
      console.log('   Mother tracking APIs work with child_id as the mother identifier');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

findMotherUsers();
