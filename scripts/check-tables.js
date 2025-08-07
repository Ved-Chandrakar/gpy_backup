const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('📋 Checking location tables...');
    
    const [tables] = await connection.execute("SHOW TABLES LIKE 'master_%'");
    console.log('Location tables found:');
    console.table(tables);
    
    // Check if our new location tables exist
    const newTables = ['master_district', 'master_block', 'master_village', 'master_panchayat', 'master_awc'];
    
    for (const tableName of newTables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`);
        console.log(`✅ ${tableName}: ${result[0].count} records`);
      } catch (error) {
        console.log(`❌ ${tableName}: Table does not exist`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
