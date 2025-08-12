const { sequelize } = require('./config/database');

async function runSpecificMigrations() {
  try {
    console.log('🔧 Running specific migrations...');
    
    // Migration 1: Add village and address to User table
    console.log('📝 Adding village and address columns to tbl_user...');
    await sequelize.query(`
      ALTER TABLE tbl_user 
      ADD COLUMN village VARCHAR(200) NULL COMMENT 'गाँव का नाम',
      ADD COLUMN address TEXT NULL COMMENT 'पूरा पता'
    `);
    console.log('✅ Added village and address to tbl_user');
    
    // Migration 2: Add village_name to Child table
    console.log('📝 Adding village_name column to tbl_child...');
    await sequelize.query(`
      ALTER TABLE tbl_child 
      ADD COLUMN village_name VARCHAR(200) NULL COMMENT 'गाँव का नाम'
    `);
    console.log('✅ Added village_name to tbl_child');
    
    console.log('🎉 All specific migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if columns already exist
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  Columns might already exist. Checking...');
      
      try {
        // Check if columns exist
        const userColumns = await sequelize.query(`DESCRIBE tbl_user`);
        const childColumns = await sequelize.query(`DESCRIBE tbl_child`);
        
        console.log('📊 Current User table columns:', userColumns[0].map(col => col.Field));
        console.log('📊 Current Child table columns:', childColumns[0].map(col => col.Field));
        
      } catch (descError) {
        console.error('Error checking columns:', descError.message);
      }
    }
  } finally {
    await sequelize.close();
  }
}

runSpecificMigrations();
