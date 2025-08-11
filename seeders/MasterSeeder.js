const fs = require('fs').promises;
const path = require('path');
const DistrictSeeder = require('./DistrictSeeder');
const BlockSeeder = require('./BlockSeeder');
const PanchayatSeeder = require('./PanchayatSeeder');
const VillageSeeder = require('./VillageSeeder');
const AWCSeeder = require('./AWCSeeder');

class MasterSeeder {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  /**
   * Create data directory if it doesn't exist
   */
  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 Data directory ready');
    } catch (error) {
      console.error('❌ Error creating data directory:', error);
      throw error;
    }
  }

  /**
   * Export all data from database to JSON files
   */
  async exportAllData() {
    try {
      console.log('🚀 Starting data export...');
      console.log('=' .repeat(50));
      
      await this.ensureDataDirectory();

      // Export Districts
      console.log('\n1. Exporting Districts...');
      const districts = await DistrictSeeder.exportToJSON();
      await this.saveToFile('districts.json', districts);

      // Export Blocks
      console.log('\n2. Exporting Blocks...');
      const blocks = await BlockSeeder.exportToJSON();
      await this.saveToFile('blocks.json', blocks);

      // Export Panchayats
      console.log('\n3. Exporting Panchayats...');
      const panchayats = await PanchayatSeeder.exportToJSON();
      await this.saveToFile('panchayats.json', panchayats);

      // Export Villages
      console.log('\n4. Exporting Villages...');
      const villages = await VillageSeeder.exportToJSON();
      await this.saveToFile('villages.json', villages);

      // Export AWCs
      console.log('\n5. Exporting AWCs...');
      const awcs = await AWCSeeder.exportToJSON();
      await this.saveToFile('awcs.json', awcs);

      console.log('\n' + '=' .repeat(50));
      console.log('✅ Data export completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   Districts: ${districts.length}`);
      console.log(`   Blocks: ${blocks.length}`);
      console.log(`   Panchayats: ${panchayats.length}`);
      console.log(`   Villages: ${villages.length}`);
      console.log(`   AWCs: ${awcs.length}`);
      console.log(`📁 Files saved in: ${this.dataDir}`);

    } catch (error) {
      console.error('❌ Error during data export:', error);
      throw error;
    }
  }

  /**
   * Save data to JSON file
   */
  async saveToFile(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`💾 Saved ${data.length} records to ${filename}`);
    } catch (error) {
      console.error(`❌ Error saving ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load data from JSON file
   */
  async loadFromFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Import all data from JSON files to database
   */
  async importAllData() {
    try {
      console.log('🚀 Starting data import...');
      console.log('=' .repeat(50));

      // Import Districts
      console.log('\n1. Importing Districts...');
      const districts = await this.loadFromFile('districts.json');
      await DistrictSeeder.seed(districts);

      // Import Blocks
      console.log('\n2. Importing Blocks...');
      const blocks = await this.loadFromFile('blocks.json');
      await BlockSeeder.seed(blocks);

      // Import Panchayats
      console.log('\n3. Importing Panchayats...');
      const panchayats = await this.loadFromFile('panchayats.json');
      await PanchayatSeeder.seed(panchayats);

      // Import Villages
      console.log('\n4. Importing Villages...');
      const villages = await this.loadFromFile('villages.json');
      await VillageSeeder.seed(villages);

      // Import AWCs
      console.log('\n5. Importing AWCs...');
      const awcs = await this.loadFromFile('awcs.json');
      await AWCSeeder.seed(awcs);

      console.log('\n' + '=' .repeat(50));
      console.log('✅ Data import completed successfully!');

    } catch (error) {
      console.error('❌ Error during data import:', error);
      throw error;
    }
  }

  /**
   * Show statistics of current data
   */
  async showStats() {
    try {
      console.log('📊 Database Statistics');
      console.log('=' .repeat(30));
      
      const districts = await DistrictSeeder.getDistricts();
      const blocks = await BlockSeeder.getBlocks();
      const panchayats = await PanchayatSeeder.getPanchayats();
      const villages = await VillageSeeder.getVillages();
      const awcs = await AWCSeeder.getAWCs();

      console.log(`Districts: ${districts.length}`);
      console.log(`Blocks: ${blocks.length}`);
      console.log(`Panchayats: ${panchayats.length}`);
      console.log(`Villages: ${villages.length}`);
      console.log(`AWCs: ${awcs.length}`);
      
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      throw error;
    }
  }
}

module.exports = MasterSeeder;
