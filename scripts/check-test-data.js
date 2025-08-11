const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('📋 Checking available data for testing...');
    
    // Check plants
    console.log('\n🌱 Available plants:');
    const [plants] = await connection.execute('SELECT id, name, local_name FROM master_plant LIMIT 10');
    console.table(plants);
    
    // Check districts
    console.log('\n🏛️ Available districts:');
    const [districts] = await connection.execute('SELECT district_code, lgd_district_code, district_name FROM master_districts LIMIT 5');
    console.table(districts);
    
    // Check blocks
    console.log('\n🏗️ Available blocks:');
    const [blocks] = await connection.execute('SELECT block_code, lgd_block_code, block_name, district_code FROM master_blocks LIMIT 5');
    console.table(blocks);
    
    // Check villages
    console.log('\n🏘️ Available villages:');
    const [villages] = await connection.execute('SELECT village_code, village_lgd_code, village_name, block_code FROM master_villages LIMIT 5');
    console.table(villages);
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await connection.end();
  }
}

checkData();
