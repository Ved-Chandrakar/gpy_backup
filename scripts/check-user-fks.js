/**
 * Check tbl_user Foreign Keys
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const checkUserForeignKeys = async () => {
  try {
    console.log('🔍 Checking tbl_user Foreign Keys...\n');

    // Check foreign keys from tbl_user
    const query = `
      SELECT 
        CONSTRAINT_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'tbl_user' 
        AND REFERENCED_TABLE_NAME IS NOT NULL 
        AND TABLE_SCHEMA = DATABASE()
    `;

    const [userFks] = await sequelize.query(query);
    
    console.log('📋 tbl_user Foreign Keys:');
    userFks.forEach(fk => {
      console.log(`- ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    // Also check the tbl_user structure
    console.log('\n📊 tbl_user structure:');
    const [userColumns] = await sequelize.query('DESCRIBE tbl_user');
    userColumns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '[PRIMARY KEY]' : ''} ${col.Key === 'MUL' ? '[FOREIGN KEY]' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error checking user foreign keys:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkUserForeignKeys();
