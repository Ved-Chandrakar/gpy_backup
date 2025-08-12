const { sequelize } = require('./config/database');

async function updateEnumValues() {
  try {
    console.log('🔄 Updating photo_type ENUM values...');
    
    await sequelize.query(`
      ALTER TABLE tbl_mother_photos 
      MODIFY COLUMN photo_type ENUM('mother_with_child', 'prescription', 'certificate', 'plant_distribution') 
      NOT NULL COMMENT 'फोटो का प्रकार (प्रमाण पत्र या पौधा वितरण फोटो)'
    `);
    
    console.log('✅ Successfully updated photo_type ENUM values');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating ENUM values:', error);
    process.exit(1);
  }
}

updateEnumValues();
