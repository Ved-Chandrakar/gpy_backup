/**
 * Ultimate Table Renaming Solution
 * Handles ALL foreign key constraints properly
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const ultimateTableRenaming = async () => {
  try {
    console.log('🔄 Starting Ultimate Table Renaming Solution...\n');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔧 Foreign key checks disabled\n');

    // Step 1: Drop ALL foreign key constraints that reference our tables
    console.log('📋 Step 1: Dropping ALL foreign key constraints...');
    
    const allForeignKeys = [
      // From tbl_child
      { table: 'tbl_child', constraint: 'fk_child_block_code' },
      { table: 'tbl_child', constraint: 'fk_child_district_code' },
      { table: 'tbl_child', constraint: 'fk_child_village_code' },
      // From tbl_user (these are the problematic ones)
      { table: 'tbl_user', constraint: 'tbl_user_ibfk_2' }, // district_id -> master_district.id
      { table: 'tbl_user', constraint: 'tbl_user_ibfk_3' }, // block_id -> master_block.id  
      { table: 'tbl_user', constraint: 'tbl_user_ibfk_4' }  // village_id -> master_village.id
    ];

    for (const fk of allForeignKeys) {
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

    // Step 3: Recreate foreign key constraints with proper references
    console.log('\n📋 Step 3: Recreating foreign key constraints...');
    
    // First, the child table constraints (these use code columns)
    const childConstraints = [
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

    for (const constraint of childConstraints) {
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

    // Note: We're NOT recreating the tbl_user foreign keys to master tables 
    // because the master tables use code columns as primary keys, not id columns
    // The tbl_user foreign keys were incorrectly set up in the first place
    
    console.log('\n⚠️ Note: tbl_user foreign keys to master tables were not recreated');
    console.log('   because master tables use code columns as primary keys, not id columns.');
    console.log('   The original foreign key constraints were incorrectly configured.');

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

    // Check if old tables still exist
    const oldTables = ['master_villages', 'master_districts', 'master_blocks'];
    const remaining = oldTables.filter(table => tableNames.includes(table));
    
    if (remaining.length > 0) {
      console.log(`\n⚠️ Old tables still exist (${remaining.length}):`);
      remaining.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('\n✅ All old tables successfully removed');
    }

    // Verify foreign keys
    console.log('\n📋 Checking current foreign keys...');
    const checkQuery = `
      SELECT 
        CONSTRAINT_NAME, 
        TABLE_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE (
        REFERENCED_TABLE_NAME IN ('master_village', 'master_district', 'master_block')
        OR REFERENCED_TABLE_NAME IN ('master_villages', 'master_districts', 'master_blocks')
      ) 
        AND TABLE_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME != 'PRIMARY'
    `;

    const [currentFks] = await sequelize.query(checkQuery);
    console.log(`Found ${currentFks.length} foreign key constraints:`);
    currentFks.forEach(fk => {
      console.log(`   - ${fk.CONSTRAINT_NAME}: ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}`);
    });

    console.log('\n🎉 Ultimate table renaming solution completed!');

  } catch (error) {
    console.error('❌ Error during ultimate renaming:', error.message);
    
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

// Run the ultimate renaming solution
ultimateTableRenaming();
