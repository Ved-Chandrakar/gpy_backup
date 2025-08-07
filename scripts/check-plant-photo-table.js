const { sequelize } = require('../config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking log_plant_photo table structure...');
    
    const [results] = await sequelize.query("DESCRIBE log_plant_photo");
    
    console.log('📋 Table Structure:');
    results.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}`);
    });
    
    // Check if our columns exist
    const verifiedByExists = results.some(col => col.Field === 'verified_by');
    const verifiedAtExists = results.some(col => col.Field === 'verified_at');
    
    console.log('\n🔍 Verification columns status:');
    console.log(`   verified_by: ${verifiedByExists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   verified_at: ${verifiedAtExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    await sequelize.close();
  }
}

checkTableStructure();
