/**
 * Check Foreign Key Constraints
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const checkForeignKeys = async () => {
  try {
    console.log('🔍 Checking Foreign Key Constraints...\n');

    // Check foreign keys that reference our target tables
    const query = `
      SELECT 
        CONSTRAINT_NAME, 
        TABLE_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME IN ('master_villages', 'master_districts', 'master_blocks') 
        AND TABLE_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME != 'PRIMARY'
    `;

    const [fks] = await sequelize.query(query);
    
    console.log('📋 Foreign Key Constraints found:');
    if (fks.length === 0) {
      console.log('   No foreign key constraints found');
    } else {
      fks.forEach((fk, index) => {
        console.log(`${index + 1}. ${fk.CONSTRAINT_NAME}`);
        console.log(`   Table: ${fk.TABLE_NAME}.${fk.COLUMN_NAME}`);
        console.log(`   References: ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}\n`);
      });
    }

    // Also check the structure of the master tables
    console.log('📊 Checking table structures...\n');
    
    const tables = ['master_villages', 'master_districts', 'master_blocks'];
    for (const table of tables) {
      try {
        const [columns] = await sequelize.query(`DESCRIBE ${table}`);
        console.log(`📋 ${table} columns:`);
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '[PRIMARY KEY]' : ''}`);
        });
        console.log('');
      } catch (error) {
        console.log(`❌ Error describing ${table}: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking foreign keys:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkForeignKeys();
