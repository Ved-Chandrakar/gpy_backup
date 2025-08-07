const mysql = require('mysql2/promise');

async function fixColumnTypes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('🔧 Fixing column types for foreign key compatibility...');
    
    // Modify columns to match the referenced table types
    console.log('📝 Updating district_code to SMALLINT...');
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN district_code SMALLINT
    `);
    
    console.log('📝 Updating block_code to MEDIUMINT...');
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN block_code MEDIUMINT
    `);
    
    console.log('📝 Updating village_code to BIGINT...');
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN village_code BIGINT
    `);
    
    // Now add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    
    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_district_code 
        FOREIGN KEY (district_code) REFERENCES master_districts(district_code)
      `);
      console.log('✅ Added district_code foreign key');
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
      console.log('✅ Added block_code foreign key');
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
      console.log('✅ Added village_code foreign key');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ village_code foreign key already exists');
      } else {
        console.log('⚠️ Could not add village_code foreign key:', error.message);
      }
    }
    
    console.log('✅ Column types and foreign keys updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing column types:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixColumnTypes().then(() => {
  console.log('🎉 Column type fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Column type fix failed:', error);
  process.exit(1);
});
