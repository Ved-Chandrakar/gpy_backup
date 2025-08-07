/**
 * Verify Table Renaming Success
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const verifyTableRenaming = async () => {
  try {
    console.log('🔍 Verifying Table Renaming Success...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Test loading all affected models
    const models = [
      { name: 'District', file: '../models/District' },
      { name: 'Block', file: '../models/Block' }, 
      { name: 'Village', file: '../models/Village' },
      { name: 'User', file: '../models/User' },
      { name: 'Child', file: '../models/Child' }
    ];

    console.log('\n📋 Testing model loading...');
    for (const model of models) {
      try {
        const Model = require(model.file);
        console.log(`✅ ${model.name} model loaded successfully`);
        
        // Test a simple query to verify table access
        const count = await Model.count();
        console.log(`   - Table has ${count} records`);
      } catch (error) {
        console.log(`❌ Error with ${model.name} model: ${error.message}`);
      }
    }

    // Final verification of table names
    console.log('\n📊 Final table verification...');
    const [allTables] = await sequelize.query('SHOW TABLES');
    const tableNames = allTables.map(row => Object.values(row)[0]);
    
    const expectedTables = ['master_village', 'master_district', 'master_block'];
    const oldTables = ['master_villages', 'master_districts', 'master_blocks'];
    
    console.log('\n✅ Expected tables found:');
    expectedTables.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} NOT FOUND`);
      }
    });

    console.log('\n🗑️ Old tables removed:');
    oldTables.forEach(table => {
      if (!tableNames.includes(table)) {
        console.log(`   ✅ ${table} successfully removed`);
      } else {
        console.log(`   ❌ ${table} still exists`);
      }
    });

    console.log('\n🎉 Table renaming verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

verifyTableRenaming();
