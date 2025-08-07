/**
 * User Table Migration Script
 * Adds device_token column and hospital_id column to tbl_user
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🔄 Running User Table Migration...');

    // Step 1: Add device_token column
    console.log('📱 Adding device_token column...');
    await sequelize.query(`
      ALTER TABLE \`tbl_user\` 
      ADD COLUMN \`device_token\` TEXT NULL 
      COMMENT 'डिवाइस टोकन (FCM/Push notifications के लिए)' 
      AFTER \`last_login\`
    `);
    console.log('✅ device_token column added successfully');

    // Step 2: Add hospital_id column
    console.log('🏥 Adding hospital_id column...');
    await sequelize.query(`
      ALTER TABLE \`tbl_user\` 
      ADD COLUMN \`hospital_id\` INT(11) NULL 
      COMMENT 'अस्पताल आईडी' 
      AFTER \`village_id\`
    `);
    console.log('✅ hospital_id column added successfully');

    // Step 3: Create indexes
    console.log('📊 Creating indexes...');
    try {
      await sequelize.query(`CREATE INDEX \`idx_user_device_token\` ON \`tbl_user\` (\`device_token\`(255))`);
      console.log('✅ device_token index created');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ device_token index already exists');
      } else {
        throw error;
      }
    }

    try {
      await sequelize.query(`CREATE INDEX \`idx_user_hospital_id\` ON \`tbl_user\` (\`hospital_id\`)`);
      console.log('✅ hospital_id index created');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️ hospital_id index already exists');
      } else {
        throw error;
      }
    }

    // Step 4: Show table structure
    console.log('📋 Updated table structure:');
    const [results] = await sequelize.query('DESCRIBE tbl_user');
    console.table(results);

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️ Columns already exist - migration may have been run before');
      
      // Show current table structure
      console.log('📋 Current table structure:');
      const [results] = await sequelize.query('DESCRIBE tbl_user');
      console.table(results);
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the migration
runMigration();
