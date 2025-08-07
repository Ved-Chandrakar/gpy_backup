const { sequelize } = require('../config/database');
const migration = require('../migrations/008_add_verification_tracking_to_plant_photos');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add verification tracking to plant photos...');
    
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
