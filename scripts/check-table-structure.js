const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('📋 Checking location table structures...');
    
    // Check districts table
    console.log('\n🏛️ master_districts structure:');
    const [districtRows] = await connection.execute('DESCRIBE master_districts');
    console.table(districtRows);
    
    // Check blocks table
    console.log('\n🏗️ master_blocks structure:');
    const [blockRows] = await connection.execute('DESCRIBE master_blocks');
    console.table(blockRows);
    
    // Check villages table
    console.log('\n🏘️ master_villages structure:');
    const [villageRows] = await connection.execute('DESCRIBE master_villages');
    console.table(villageRows);
    
  } catch (error) {
    console.error('❌ Error checking table structures:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
