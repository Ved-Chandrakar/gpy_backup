const { sequelize } = require('../config/database');

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table...\n');

    // Get table structure
    const [results] = await sequelize.query('DESCRIBE tbl_user');
    console.log('📋 User table structure:');
    console.table(results);

    // Get actual users
    const [users] = await sequelize.query('SELECT userid, name, role_id, is_active FROM tbl_user LIMIT 10');
    console.log('\n👥 Users in database:');
    console.table(users);

    // Get roles
    const [roles] = await sequelize.query('SELECT id, name FROM master_role');
    console.log('\n🏷️  Available roles:');
    console.table(roles);

    // Get children/mothers
    const [children] = await sequelize.query('SELECT id, mother_name, mother_mobile, child_name FROM tbl_child LIMIT 5');
    console.log('\n👶 Children/Mothers in database:');
    console.table(children);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsersTable();
