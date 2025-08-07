const { Village } = require('../models');

class VillageSeeder {
  /**
   * Get all villages from database
   */
  static async getVillages() {
    try {
      const villages = await Village.findAll({
        order: [['village_code', 'ASC']]
      });
      
      console.log('🏘️ Villages found:', villages.length);
      return villages;
    } catch (error) {
      console.error('❌ Error fetching villages:', error);
      throw error;
    }
  }

  /**
   * Export villages data to JSON format
   */
  static async exportToJSON() {
    try {
      const villages = await this.getVillages();
      const data = villages.map(village => ({
        village_code: village.village_code,
        village_lgd_code: village.village_lgd_code,
        village_name: village.village_name,
        panchayat_code: village.panchayat_code,
        panchayat_lgd_code: village.panchayat_lgd_code,
        panchayat_name: village.panchayat_name,
        block_code: village.block_code,
        block_lgd_code: village.block_lgd_code,
        block_name: village.block_name,
        district_code: village.district_code,
        district_lgd_code: village.district_lgd_code,
        district_name: village.district_name
      }));

      console.log('📊 Villages export data:');
      console.table(data.slice(0, 10)); // Show first 10 for preview
      console.log(`... and ${data.length - 10} more villages`);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting villages:', error);
      throw error;
    }
  }

  /**
   * Seed villages data (if needed for migration)
   */
  static async seed(villagesData) {
    try {
      console.log('🌱 Seeding villages...');
      
      for (const villageData of villagesData) {
        await Village.findOrCreate({
          where: { village_code: villageData.village_code },
          defaults: villageData
        });
      }
      
      console.log('✅ Villages seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding villages:', error);
      throw error;
    }
  }
}

module.exports = VillageSeeder;
