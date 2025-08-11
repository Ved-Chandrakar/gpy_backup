#!/usr/bin/env node

/**
 * Database Seeder Script
 * 
 * This script allows you to export/import data from the new database structure:
 * - master_districts
 * - master_blocks 
 * - master_panchayats
 * - master_villages
 * - tbl_awcs
 * 
 * Usage:
 * node scripts/seeder.js export    # Export data to JSON files
 * node scripts/seeder.js import    # Import data from JSON files  
 * node scripts/seeder.js stats     # Show current data statistics
 */

const MasterSeeder = require('../seeders/MasterSeeder');

async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('📝 Usage:');
    console.log('  node scripts/seeder.js export    # Export data to JSON files');
    console.log('  node scripts/seeder.js import    # Import data from JSON files');
    console.log('  node scripts/seeder.js stats     # Show current data statistics');
    process.exit(0);
  }

  const seeder = new MasterSeeder();

  try {
    switch (command.toLowerCase()) {
      case 'export':
        console.log('🚀 Exporting data from database...');
        await seeder.exportAllData();
        break;
        
      case 'import':
        console.log('🚀 Importing data to database...');
        await seeder.importAllData();
        break;
        
      case 'stats':
        console.log('🚀 Getting database statistics...');
        await seeder.showStats();
        break;
        
      default:
        console.error('❌ Unknown command:', command);
        console.log('Valid commands: export, import, stats');
        process.exit(1);
    }
    
    console.log('🎉 Operation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { MasterSeeder };
