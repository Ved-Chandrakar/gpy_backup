const { Village } = require('../models');

const checkVillageColumns = async () => {
  try {
    console.log('🏘️ Checking Village table structure...');
    
    // Get table description
    const [results] = await Village.sequelize.query("DESCRIBE master_village");
    
    console.log('✅ Village table columns:');
    console.log('┌─────────────────────────┬─────────────┬─────────────┐');
    console.log('│        Column           │    Type     │    Null     │');
    console.log('├─────────────────────────┼─────────────┼─────────────┤');
    
    results.forEach(col => {
      const field = col.Field.padEnd(23);
      const type = col.Type.padEnd(11);
      const nullValue = col.Null.padEnd(11);
      console.log(`│ ${field} │ ${type} │ ${nullValue} │`);
    });
    
    console.log('└─────────────────────────┴─────────────┴─────────────┘');
    
    // Check if the problematic column exists
    const hasLgdVillageCode = results.some(col => col.Field === 'lgd_village_code');
    const hasVillageLgdCode = results.some(col => col.Field === 'village_lgd_code');
    
    console.log(`\n📝 Column existence check:`);
    console.log(`   lgd_village_code: ${hasLgdVillageCode ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`   village_lgd_code: ${hasVillageLgdCode ? '✅ EXISTS' : '❌ NOT FOUND'}`);

  } catch (error) {
    console.error('❌ Error checking village columns:', error.message);
  }
};

checkVillageColumns().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
