#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * Adds is_password_changed column to tbl_user table
 * This field tracks whether user has changed their default password
 */

const { sequelize } = require('../config/database');

async function addPasswordChangeColumn() {
  try {
    console.log('🔄 Adding is_password_changed column to tbl_user table...');
    console.log('=' .repeat(60));

    // Add is_password_changed column
    await sequelize.query(`
      ALTER TABLE tbl_user 
      ADD COLUMN is_password_changed TINYINT(1) NOT NULL DEFAULT 0 
      COMMENT 'पासवर्ड बदला गया है (0 = नहीं, 1 = हाँ)'
    `);
    
    console.log('✅ Successfully added is_password_changed column');

    // Verify the column was added
    const [results] = await sequelize.query(`
      DESCRIBE tbl_user is_password_changed
    `);
    
    if (results.length > 0) {
      console.log('✅ Column verification successful:');
      console.log('   Field:', results[0].Field);
      console.log('   Type:', results[0].Type);
      console.log('   Default:', results[0].Default);
      console.log('   Comment:', results[0].Comment || 'No comment');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('🔑 New mothers will have is_password_changed = 0 by default');
    console.log('📝 Update to 1 when user changes their password');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Column is_password_changed already exists in tbl_user table');
    } else {
      throw error;
    }
  }
}

// Run the migration
if (require.main === module) {
  addPasswordChangeColumn()
    .then(() => {
      console.log('\n🎉 Database migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addPasswordChangeColumn };
