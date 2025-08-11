const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('👥 Checking users in database...');
    
    const [users] = await connection.execute('SELECT userid, name, role_id, is_active FROM tbl_user LIMIT 10');
    console.table(users);
    
    console.log('\n🔑 Checking roles...');
    const [roles] = await connection.execute('SELECT * FROM master_role');
    console.table(roles);
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsers();
