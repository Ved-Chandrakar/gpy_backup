/**
 * Final Table Renaming - Corrected Version
 * Uses MySQL specific commands to handle foreign keys properly
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const finalTableRenaming = async () => {
  try {
    console.log('🔄 Starting Final Table Renaming...\n');

    // Disable foreign key checks completely
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔧 Foreign key checks disabled');

    // Step 1: Rename the problematic tables one by one
    const renames = [
      { from: 'master_villages', to: 'master_village' },
      { from: 'master_districts', to: 'master_district' },
      { from: 'master_blocks', to: 'master_block' }
    ];

    for (const rename of renames) {
      try {
        // Check if source table exists
        const [tables] = await sequelize.query(`SHOW TABLES LIKE '${rename.from}'`);
        
        if (tables.length > 0) {
          console.log(`🔄 Renaming ${rename.from} to ${rename.to}...`);
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
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔧 Foreign key checks re-enabled');

    // Verification
    console.log('\n📊 Final verification...');
    const [allTables] = await sequelize.query('SHOW TABLES');
    const tableNames = allTables.map(row => Object.values(row)[0]);
    
    console.log('\n📋 All tables:');
    tableNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    // Check specifically for our renamed tables
    const targetTables = ['master_village', 'master_district', 'master_block'];
    const successful = targetTables.filter(table => tableNames.includes(table));
    
    console.log(`\n✅ Successfully renamed ${successful.length}/${targetTables.length} tables:`);
    successful.forEach(table => console.log(`   - ${table}`));

    console.log('\n🎉 Final table renaming completed!');

  } catch (error) {
    console.error('❌ Error during final renaming:', error.message);
    
    // Always try to re-enable foreign key checks
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (fkError) {
      console.error('❌ Could not re-enable foreign key checks');
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the final renaming
finalTableRenaming();
