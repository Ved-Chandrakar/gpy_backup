const { sequelize } = require('./config/database');
const migration = require('./migrations/015_create_mother_photos_table.js');

async function runMigration() {
  try {
    console.log('Running mother photos table migration...');
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('✅ Mother photos table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
