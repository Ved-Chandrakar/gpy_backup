const mysql = require('mysql2/promise');

async function fixDatabaseSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'green_paalna_yojna'
  });

  try {
    console.log('🔧 Fixing database schema for location tables...');
    
    // Step 1: Drop old foreign key constraints
    console.log('🗑️ Dropping old foreign key constraints...');
    
    try {
      await connection.execute(`ALTER TABLE tbl_child DROP FOREIGN KEY tbl_child_ibfk_2`);
      console.log('✅ Dropped tbl_child_ibfk_2');
    } catch (error) {
      console.log('ℹ️ tbl_child_ibfk_2 already dropped or does not exist');
    }
    
    try {
      await connection.execute(`ALTER TABLE tbl_child DROP FOREIGN KEY tbl_child_ibfk_3`);
      console.log('✅ Dropped tbl_child_ibfk_3');
    } catch (error) {
      console.log('ℹ️ tbl_child_ibfk_3 already dropped or does not exist');
    }
    
    try {
      await connection.execute(`ALTER TABLE tbl_child DROP FOREIGN KEY tbl_child_ibfk_4`);
      console.log('✅ Dropped tbl_child_ibfk_4');
    } catch (error) {
      console.log('ℹ️ tbl_child_ibfk_4 already dropped or does not exist');
    }
    
    // Step 2: Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('⏸️ Temporarily disabled foreign key checks');
    
    // Step 3: Modify column types
    console.log('📝 Updating column types...');
    
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN district_code SMALLINT
    `);
    console.log('✅ Updated district_code to SMALLINT');
    
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN block_code MEDIUMINT
    `);
    console.log('✅ Updated block_code to MEDIUMINT');
    
    await connection.execute(`
      ALTER TABLE tbl_child 
      MODIFY COLUMN village_code BIGINT
    `);
    console.log('✅ Updated village_code to BIGINT');
    
    // Step 4: Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('▶️ Re-enabled foreign key checks');
    
    // Step 5: Add new foreign key constraints
    console.log('🔗 Adding new foreign key constraints...');
    
    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_district_code 
        FOREIGN KEY (district_code) REFERENCES master_districts(district_code)
      `);
      console.log('✅ Added district_code foreign key');
    } catch (error) {
      console.log('⚠️ Could not add district_code foreign key:', error.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_block_code 
        FOREIGN KEY (block_code) REFERENCES master_blocks(block_code)
      `);
      console.log('✅ Added block_code foreign key');
    } catch (error) {
      console.log('⚠️ Could not add block_code foreign key:', error.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE tbl_child 
        ADD CONSTRAINT fk_child_village_code 
        FOREIGN KEY (village_code) REFERENCES master_villages(village_code)
      `);
      console.log('✅ Added village_code foreign key');
    } catch (error) {
      console.log('⚠️ Could not add village_code foreign key:', error.message);
    }
    
    // Step 6: Show final table structure
    console.log('📋 Final table structure:');
    const [rows] = await connection.execute('DESCRIBE tbl_child');
    console.table(rows);
    
    console.log('✅ Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixDatabaseSchema().then(() => {
  console.log('🎉 Database schema fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Database schema fix failed:', error);
  process.exit(1);
});
