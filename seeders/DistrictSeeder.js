const { District } = require('../models');

class DistrictSeeder {
  /**
   * Get all districts from database
   */
  static async getDistricts() {
    try {
      const districts = await District.findAll({
        order: [['district_code', 'ASC']]
      });
      
      console.log('📍 Districts found:', districts.length);
      return districts;
    } catch (error) {
      console.error('❌ Error fetching districts:', error);
      throw error;
    }
  }

  /**
   * Export districts data to JSON format
   */
  static async exportToJSON() {
    try {
      const districts = await this.getDistricts();
      const data = districts.map(district => ({
        district_code: district.district_code,
        lgd_district_code: district.lgd_district_code,
        district_name: district.district_name
      }));

      console.log('📊 Districts export data:');
      console.table(data);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting districts:', error);
      throw error;
    }
  }

  /**
   * Seed districts data (if needed for migration)
   */
  static async seed(districtsData) {
    try {
      console.log('🌱 Seeding districts...');
      
      for (const districtData of districtsData) {
        await District.findOrCreate({
          where: { district_code: districtData.district_code },
          defaults: districtData
        });
      }
      
      console.log('✅ Districts seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding districts:', error);
      throw error;
    }
  }
}

module.exports = DistrictSeeder;
