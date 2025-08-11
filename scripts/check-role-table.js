const db = require('../models');

async function checkRoleTable() {
  try {
    console.log('🔍 Checking master_role table structure...');
    const result = await db.sequelize.query('DESCRIBE master_role', { type: db.sequelize.QueryTypes.SELECT });
    console.log('master_role table structure:');
    result.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type}`);
    });
    
    console.log('\n📊 Sample role data:');
    const roles = await db.sequelize.query('SELECT * FROM master_role LIMIT 5', { type: db.sequelize.QueryTypes.SELECT });
    roles.forEach((role, index) => {
      console.log(`  ${index + 1}.`, Object.keys(role).map(key => `${key}: ${role[key]}`).join(', '));
    });
    
    // Check what role ID 3 is
    const role3 = await db.sequelize.query('SELECT * FROM master_role WHERE id = 3', { type: db.sequelize.QueryTypes.SELECT });
    if (role3.length > 0) {
      console.log('\n👩 Role ID 3 details:');
      console.log('  Fields:', Object.keys(role3[0]));
      console.log('  Values:', Object.values(role3[0]));
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

checkRoleTable();
