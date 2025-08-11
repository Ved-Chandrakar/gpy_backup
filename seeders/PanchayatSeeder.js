const { Panchayat } = require('../models');

class PanchayatSeeder {
  /**
   * Get all panchayats from database
   */
  static async getPanchayats() {
    try {
      const panchayats = await Panchayat.findAll({
        order: [['panchayat_code', 'ASC']]
      });
      
      console.log('🏛️ Panchayats found:', panchayats.length);
      return panchayats;
    } catch (error) {
      console.error('❌ Error fetching panchayats:', error);
      throw error;
    }
  }

  /**
   * Export panchayats data to JSON format
   */
  static async exportToJSON() {
    try {
      const panchayats = await this.getPanchayats();
      const data = panchayats.map(panchayat => ({
        panchayat_code: panchayat.panchayat_code,
        lgd_panchayat_code: panchayat.lgd_panchayat_code,
        panchayat_name: panchayat.panchayat_name,
        block_code: panchayat.block_code,
        lgd_block_code: panchayat.lgd_block_code,
        block_name: panchayat.block_name,
        district_code: panchayat.district_code,
        lgd_district_code: panchayat.lgd_district_code,
        district_name: panchayat.district_name
      }));

      console.log('📊 Panchayats export data:');
      console.table(data.slice(0, 10)); // Show first 10 for preview
      console.log(`... and ${data.length - 10} more panchayats`);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting panchayats:', error);
      throw error;
    }
  }

  /**
   * Seed panchayats data (if needed for migration)
   */
  static async seed(panchayatsData) {
    try {
      console.log('🌱 Seeding panchayats...');
      
      for (const panchayatData of panchayatsData) {
        await Panchayat.findOrCreate({
          where: { panchayat_code: panchayatData.panchayat_code },
          defaults: panchayatData
        });
      }
      
      console.log('✅ Panchayats seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding panchayats:', error);
      throw error;
    }
  }
}

module.exports = PanchayatSeeder;
