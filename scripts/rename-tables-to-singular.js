/**
 * Table Renaming Migration Script
 * Renames all plural table names to singular names
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const runTableRenaming = async () => {
  try {
    console.log('🔄 Starting Table Renaming Migration...\n');

    // List of tables to rename (plural -> singular)
    const tableRenames = [
      { from: 'master_villages', to: 'master_village' },
      { from: 'master_panchayats', to: 'master_panchayat' },
      { from: 'master_districts', to: 'master_district' },
      { from: 'master_blocks', to: 'master_block' },
      { from: 'tbl_fcm_tokens', to: 'tbl_fcm_token' },
      { from: 'tbl_awcs', to: 'tbl_awc' }
    ];

    // Check which tables exist before renaming
    console.log('📋 Checking existing tables...');
    const [existingTables] = await sequelize.query('SHOW TABLES');
    const tableNames = existingTables.map(row => Object.values(row)[0]);
    
    console.log('Current tables:', tableNames.join(', '));

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
        if (error.message.includes("doesn't exist")) {
          console.log(`ℹ️ Table ${rename.from} doesn't exist - skipping`);
        } else if (error.message.includes("already exists")) {
          console.log(`ℹ️ Table ${rename.to} already exists - ${rename.from} may already be renamed`);
        } else {
          console.error(`❌ Error renaming ${rename.from}: ${error.message}`);
        }
      }
    }

    // Verify renamed tables
    console.log('\n📊 Verification - checking renamed tables...');
    const [newTables] = await sequelize.query('SHOW TABLES');
    const newTableNames = newTables.map(row => Object.values(row)[0]);
    
    const renamedTables = tableRenames.map(r => r.to).filter(name => newTableNames.includes(name));
    console.log('✅ Successfully renamed tables:', renamedTables.join(', '));

    // Show final table list
    console.log('\n📋 All tables after renaming:');
    newTableNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    console.log('\n🎉 Table renaming migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Models have been updated to use singular table names');
    console.log('2. Foreign key references have been updated');
    console.log('3. Restart the server to load the updated models');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the migration
runTableRenaming();
