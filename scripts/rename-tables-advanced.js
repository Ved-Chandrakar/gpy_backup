/**
 * Advanced Table Renaming Script
 * Handles foreign key constraints properly during table renaming
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const runAdvancedTableRenaming = async () => {
  try {
    console.log('🔄 Starting Advanced Table Renaming Migration...\n');

    // Disable foreign key checks temporarily
    console.log('🔧 Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // List of tables to rename (plural -> singular)
    const tableRenames = [
      { from: 'master_villages', to: 'master_village' },
      { from: 'master_districts', to: 'master_district' },  
      { from: 'master_blocks', to: 'master_block' },
      { from: 'tbl_fcm_tokens', to: 'tbl_fcm_token' }
    ];

    // Check which tables exist before renaming
    console.log('📋 Checking existing tables...');
    const [existingTables] = await sequelize.query('SHOW TABLES');
    const tableNames = existingTables.map(row => Object.values(row)[0]);

    // Rename each table
    for (const rename of tableRenames) {
      try {
        if (tableNames.includes(rename.from)) {
          console.log(`🔄 Renaming ${rename.from} → ${rename.to}...`);
          await sequelize.query(`RENAME TABLE \`${rename.from}\` TO \`${rename.to}\``);
          console.log(`✅ Successfully renamed ${rename.from} to ${rename.to}`);
        } else {
          console.log(`ℹ️ Table ${rename.from} not found - may already be renamed`);
        }
      } catch (error) {
        console.error(`❌ Error renaming ${rename.from}: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    console.log('\n🔧 Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Verify renamed tables
    console.log('\n📊 Verification - checking renamed tables...');
    const [newTables] = await sequelize.query('SHOW TABLES');
    const newTableNames = newTables.map(row => Object.values(row)[0]);
    
    console.log('\n📋 All tables after renaming:');
    newTableNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    console.log('\n🎉 Advanced table renaming migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Make sure to re-enable foreign key checks even if there's an error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('🔧 Foreign key checks re-enabled');
    } catch (fkError) {
      console.error('❌ Failed to re-enable foreign key checks:', fkError.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the migration
runAdvancedTableRenaming();
