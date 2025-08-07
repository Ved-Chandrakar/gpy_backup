const db = require('../models');

async function checkRoles() {
  try {
    console.log('🔍 Checking available roles...');
    const roles = await db.Role.findAll();
    console.log('Available roles:');
    roles.forEach(role => {
      console.log(`  ID: ${role.id}, Name: ${role.role_name}, Type: ${role.role_type}`);
    });
    
    console.log('\n👩 Checking mother users...');
    const motherUsers = await db.User.findAll({ 
      where: { role_id: 3 }, 
      include: [{ model: db.Role, as: 'role' }],
      limit: 1 
    });
    
    if (motherUsers.length > 0) {
      console.log('Mother user details:');
      console.log(`  Role ID: ${motherUsers[0].role_id}`);
      console.log(`  Role Name: ${motherUsers[0].role?.role_name}`);
      console.log(`  Role Type: ${motherUsers[0].role?.role_type}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

checkRoles();
