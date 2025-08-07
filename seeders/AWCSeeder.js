const { AWC } = require('../models');

class AWCSeeder {
  /**
   * Get all AWCs from database
   */
  static async getAWCs() {
    try {
      const awcs = await AWC.findAll({
        order: [['id', 'ASC']]
      });
      
      console.log('🏢 AWCs found:', awcs.length);
      return awcs;
    } catch (error) {
      console.error('❌ Error fetching AWCs:', error);
      throw error;
    }
  }

  /**
   * Export AWCs data to JSON format
   */
  static async exportToJSON() {
    try {
      const awcs = await this.getAWCs();
      const data = awcs.map(awc => ({
        id: awc.id,
        district: awc.district,
        project_code: awc.project_code,
        project: awc.project,
        sector_code: awc.sector_code,
        sector: awc.sector,
        awc_name: awc.awc_name,
        awc_code: awc.awc_code,
        district_lgd_code: awc.district_lgd_code,
        district_code: awc.district_code,
        area: awc.area,
        gp_nnn_code: awc.gp_nnn_code,
        gram_ward_code: awc.gram_ward_code,
        block: awc.block,
        is_under_nny: awc.is_under_nny,
        is_under_janman: awc.is_under_janman,
        awc_belong: awc.awc_belong,
        awc_type: awc.awc_type,
        latitude: awc.latitude,
        longitude: awc.longitude,
        building_ownership: awc.building_ownership,
        building_type: awc.building_type,
        toilet: awc.toilet
      }));

      console.log('📊 AWCs export data:');
      console.table(data.slice(0, 5)); // Show first 5 for preview
      console.log(`... and ${data.length - 5} more AWCs`);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting AWCs:', error);
      throw error;
    }
  }

  /**
   * Seed AWCs data (if needed for migration)
   */
  static async seed(awcsData) {
    try {
      console.log('🌱 Seeding AWCs...');
      
      for (const awcData of awcsData) {
        await AWC.findOrCreate({
          where: { id: awcData.id },
          defaults: awcData
        });
      }
      
      console.log('✅ AWCs seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding AWCs:', error);
      throw error;
    }
  }
}

module.exports = AWCSeeder;
