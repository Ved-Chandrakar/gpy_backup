const { Village } = require('../models');

const checkAllTables = async () => {
  try {
    console.log('🔍 Checking available tables...');
    
    // Check all tables
    const [results] = await Village.sequelize.query("SHOW TABLES");
    
    console.log('✅ Available tables:');
    results.forEach((table, index) => {
      const tableName = table[`Tables_in_green_paalna_yojna`];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // Try to find village-related tables
    const villageTables = results.filter(table => {
      const tableName = table[`Tables_in_green_paalna_yojna`];
      return tableName.toLowerCase().includes('village');
    });
    
    console.log(`\n🏘️ Village-related tables found: ${villageTables.length}`);
    villageTables.forEach(table => {
      const tableName = table[`Tables_in_green_paalna_yojna`];
      console.log(`   - ${tableName}`);
    });
    
    if (villageTables.length > 0) {
      // Check structure of first village table
      const firstVillageTable = villageTables[0][`Tables_in_green_paalna_yojna`];
      console.log(`\n📋 Structure of ${firstVillageTable}:`);
      
      const [structure] = await Village.sequelize.query(`DESCRIBE ${firstVillageTable}`);
      
      console.log('┌─────────────────────────┬─────────────┬─────────────┐');
      console.log('│        Column           │    Type     │    Null     │');
      console.log('├─────────────────────────┼─────────────┼─────────────┤');
      
      structure.forEach(col => {
        const field = col.Field.padEnd(23);
        const type = col.Type.padEnd(11);
        const nullValue = col.Null.padEnd(11);
        console.log(`│ ${field} │ ${type} │ ${nullValue} │`);
      });
      
      console.log('└─────────────────────────┴─────────────┴─────────────┘');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
};

checkAllTables().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
