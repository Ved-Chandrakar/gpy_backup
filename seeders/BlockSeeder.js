const { Block } = require('../models');

class BlockSeeder {
  /**
   * Get all blocks from database
   */
  static async getBlocks() {
    try {
      const blocks = await Block.findAll({
        order: [['block_code', 'ASC']]
      });
      
      console.log('🏘️ Blocks found:', blocks.length);
      return blocks;
    } catch (error) {
      console.error('❌ Error fetching blocks:', error);
      throw error;
    }
  }

  /**
   * Export blocks data to JSON format
   */
  static async exportToJSON() {
    try {
      const blocks = await this.getBlocks();
      const data = blocks.map(block => ({
        block_code: block.block_code,
        lgd_block_code: block.lgd_block_code,
        block_name: block.block_name,
        district_code: block.district_code,
        lgd_district_code: block.lgd_district_code
      }));

      console.log('📊 Blocks export data:');
      console.table(data.slice(0, 10)); // Show first 10 for preview
      console.log(`... and ${data.length - 10} more blocks`);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting blocks:', error);
      throw error;
    }
  }

  /**
   * Seed blocks data (if needed for migration)
   */
  static async seed(blocksData) {
    try {
      console.log('🌱 Seeding blocks...');
      
      for (const blockData of blocksData) {
        await Block.findOrCreate({
          where: { block_code: blockData.block_code },
          defaults: blockData
        });
      }
      
      console.log('✅ Blocks seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding blocks:', error);
      throw error;
    }
  }
}

module.exports = BlockSeeder;
