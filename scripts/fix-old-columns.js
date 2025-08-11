const mysql = require('mysql2/promise');

async function fixOldColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('🔧 Making old columns nullable...');
    
    // Make old location columns nullable since we have the new code columns
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN district_id INT NULL
    `);
    console.log('✅ Made district_id nullable');
    
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN block_id INT NULL
    `);
    console.log('✅ Made block_id nullable');
    
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN village_id INT NULL
    `);
    console.log('✅ Made village_id nullable');
    
    console.log('✅ Old columns are now nullable');
    
  } catch (error) {
    console.error('❌ Error fixing old columns:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixOldColumns().then(() => {
  console.log('🎉 Old columns fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Old columns fix failed:', error);
  process.exit(1);
});
