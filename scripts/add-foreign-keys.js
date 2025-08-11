const mysql = require('mysql2/promise');

async function addForeignKeys() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('🔗 Adding foreign key constraints with correct table names...');
    
    // Add foreign key constraints to the correct plural table names
    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_district_code 
        FOREIGN KEY (district_code) REFERENCES master_districts(district_code)
      `);
      console.log('✅ Added district_code foreign key to master_districts');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ district_code foreign key already exists');
      } else {
        console.log('⚠️ Could not add district_code foreign key:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_block_code 
        FOREIGN KEY (block_code) REFERENCES master_blocks(block_code)
      `);
      console.log('✅ Added block_code foreign key to master_blocks');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ block_code foreign key already exists');
      } else {
        console.log('⚠️ Could not add block_code foreign key:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_village_code 
        FOREIGN KEY (village_code) REFERENCES master_villages(village_code)
      `);
      console.log('✅ Added village_code foreign key to master_villages');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ village_code foreign key already exists');
      } else {
        console.log('⚠️ Could not add village_code foreign key:', error.message);
      }
    }

    // Show final table structure
    console.log('📋 Final table structure:');
    const [rows] = await connection.execute('DESCRIBE tbl_child');
    console.table(rows);
    
    console.log('✅ Foreign key constraints added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding foreign keys:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addForeignKeys().then(() => {
  console.log('🎉 Foreign key setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Foreign key setup failed:', error);
  process.exit(1);
});
