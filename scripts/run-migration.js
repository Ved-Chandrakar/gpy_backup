const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('🔄 Running migration to fix foreign key constraints...');
    
    // Step 1: Add new columns
    console.log('📝 Adding new code columns...');
    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD COLUMN district_code INT AFTER hospital_id
      `);
      console.log('✅ Added district_code column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ district_code column already exists');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD COLUMN block_code INT AFTER district_code
      `);
      console.log('✅ Added block_code column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ block_code column already exists');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD COLUMN village_code INT AFTER block_code
      `);
      console.log('✅ Added village_code column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ village_code column already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_district_code 
        FOREIGN KEY (district_code) REFERENCES master_district(district_code)
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
        FOREIGN KEY (block_code) REFERENCES master_block(block_code)
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
        FOREIGN KEY (village_code) REFERENCES master_village(village_code)
      `);
      console.log('✅ Added village_code foreign key');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ village_code foreign key already exists');
      } else {
        console.log('⚠️ Could not add village_code foreign key:', error.message);
      }
    }

    // Step 3: Show table structure
    console.log('📋 Showing updated table structure...');
    const [rows] = await connection.execute('DESCRIBE tbl_child');
    console.table(rows);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the migration
runMigration().then(() => {
  console.log('🎉 Migration process completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Migration process failed:', error);
  process.exit(1);
});
