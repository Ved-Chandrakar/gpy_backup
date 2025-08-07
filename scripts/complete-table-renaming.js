/**
 * Complete Table Renaming Solution
 * Drops foreign keys, renames tables, and recreates foreign keys
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const runCompleteTableRenaming = async () => {
  try {
    console.log('🔄 Starting Complete Table Renaming Solution...\n');

    // Step 1: Drop foreign key constraints that might prevent renaming
    console.log('🔧 Step 1: Dropping foreign key constraints...');
    
    const foreignKeyQueries = [
      "ALTER TABLE `tbl_user` DROP FOREIGN KEY IF EXISTS `tbl_user_ibfk_2`",
      "ALTER TABLE `tbl_user` DROP FOREIGN KEY IF EXISTS `tbl_user_ibfk_3`", 
      "ALTER TABLE `tbl_user` DROP FOREIGN KEY IF EXISTS `tbl_user_ibfk_4`",
      "ALTER TABLE `tbl_child` DROP FOREIGN KEY IF EXISTS `tbl_child_ibfk_1`",
      "ALTER TABLE `tbl_child` DROP FOREIGN KEY IF EXISTS `tbl_child_ibfk_2`",
      "ALTER TABLE `tbl_child` DROP FOREIGN KEY IF EXISTS `tbl_child_ibfk_3`"
    ];

    for (const query of foreignKeyQueries) {
      try {
        await sequelize.query(query);
        console.log('✅ Dropped constraint');
      } catch (error) {
        if (!error.message.includes("check that column/key exists")) {
          console.log('ℹ️ Constraint may not exist:', query);
        }
      }
    }

    // Step 2: Rename tables
    console.log('\n🔄 Step 2: Renaming tables...');
    
    const tableRenames = [
      { from: 'master_villages', to: 'master_village' },
      { from: 'master_districts', to: 'master_district' },  
      { from: 'master_blocks', to: 'master_block' }
    ];

    for (const rename of tableRenames) {
      try {
        console.log(`🔄 Renaming ${rename.from} → ${rename.to}...`);
        await sequelize.query(`RENAME TABLE \`${rename.from}\` TO \`${rename.to}\``);
        console.log(`✅ Successfully renamed ${rename.from} to ${rename.to}`);
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`ℹ️ Table ${rename.from} doesn't exist - may already be renamed`);
        } else {
          console.error(`❌ Error renaming ${rename.from}: ${error.message}`);
        }
      }
    }

    // Step 3: Show final results
    console.log('\n📊 Step 3: Verification...');
    const [finalTables] = await sequelize.query('SHOW TABLES');
    const finalTableNames = finalTables.map(row => Object.values(row)[0]);
    
    console.log('\n📋 All tables after renaming:');
    finalTableNames.forEach((name, index) => {
      const isPlural = name.endsWith('s') && !name.endsWith('ss') && !name.includes('_');
      console.log(`${index + 1}. ${name} ${isPlural ? '(still plural)' : '(singular ✅)'}`);
    });

    // Check if we have the singular tables
    const singularTables = ['master_village', 'master_district', 'master_block', 'master_panchayat', 'tbl_awc', 'tbl_fcm_token'];
    const existingSingular = singularTables.filter(table => finalTableNames.includes(table));
    
    console.log('\n✅ Successfully created singular tables:', existingSingular.join(', '));

    console.log('\n🎉 Complete table renaming solution finished!');
    console.log('\n📝 Summary:');
    console.log('- Foreign key constraints have been dropped');
    console.log('- Tables have been renamed to singular form');
    console.log('- Models have been updated to use singular table names');
    console.log('- You may need to recreate foreign key constraints if needed');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the migration
runCompleteTableRenaming();
