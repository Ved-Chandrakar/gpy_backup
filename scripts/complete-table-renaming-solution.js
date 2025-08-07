/**
 * Complete Table Renaming Solution
 * 1. Drop foreign key constraints
 * 2. Rename tables
 * 3. Recreate foreign key constraints
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const completeTableRenaming = async () => {
  try {
    console.log('🔄 Starting Complete Table Renaming Solution...\n');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔧 Foreign key checks disabled\n');

    // Step 1: Drop foreign key constraints that reference our tables
    console.log('📋 Step 1: Dropping foreign key constraints...');
    
    const foreignKeys = [
      { table: 'tbl_child', constraint: 'fk_child_block_code' },
      { table: 'tbl_child', constraint: 'fk_child_district_code' },
      { table: 'tbl_child', constraint: 'fk_child_village_code' }
    ];

    for (const fk of foreignKeys) {
      try {
        await sequelize.query(`ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.constraint}`);
        console.log(`✅ Dropped constraint ${fk.constraint} from ${fk.table}`);
      } catch (error) {
        console.log(`⚠️ Could not drop ${fk.constraint}: ${error.message}`);
      }
    }

    // Step 2: Rename tables
    console.log('\n📋 Step 2: Renaming tables...');
    
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

    // Step 3: Recreate foreign key constraints with new table names
    console.log('\n📋 Step 3: Recreating foreign key constraints...');
    
    const newConstraints = [
      {
        table: 'tbl_child',
        constraint: 'fk_child_block_code',
        column: 'block_code',
        references: 'master_block(block_code)'
      },
      {
        table: 'tbl_child',
        constraint: 'fk_child_district_code',
        column: 'district_code',
        references: 'master_district(district_code)'
      },
      {
        table: 'tbl_child',
        constraint: 'fk_child_village_code',
        column: 'village_code',
        references: 'master_village(village_code)'
      }
    ];

    for (const constraint of newConstraints) {
      try {
        const sql = `ALTER TABLE ${constraint.table} 
                     ADD CONSTRAINT ${constraint.constraint} 
                     FOREIGN KEY (${constraint.column}) 
                     REFERENCES ${constraint.references}`;
        
        await sequelize.query(sql);
        console.log(`✅ Created constraint ${constraint.constraint} for ${constraint.table}`);
      } catch (error) {
        console.log(`⚠️ Could not create ${constraint.constraint}: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🔧 Foreign key checks re-enabled');

    // Final verification
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

    // Verify foreign keys were recreated
    console.log('\n📋 Checking recreated foreign keys...');
    const checkQuery = `
      SELECT 
        CONSTRAINT_NAME, 
        TABLE_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME IN ('master_village', 'master_district', 'master_block') 
        AND TABLE_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME != 'PRIMARY'
    `;

    const [newFks] = await sequelize.query(checkQuery);
    console.log(`Found ${newFks.length} foreign key constraints:`);
    newFks.forEach(fk => {
      console.log(`   - ${fk.CONSTRAINT_NAME}: ${fk.TABLE_NAME} -> ${fk.REFERENCED_TABLE_NAME}`);
    });

    console.log('\n🎉 Complete table renaming solution completed!');

  } catch (error) {
    console.error('❌ Error during complete renaming:', error.message);
    
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

// Run the complete renaming solution
completeTableRenaming();
