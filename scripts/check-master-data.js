/**
 * Check Master Data for Testing
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

const checkMasterData = async () => {
  try {
    console.log('🔍 Checking Master Data...\n');

    // Check districts
    const [districts] = await sequelize.query('SELECT district_code, lgd_district_code, district_name FROM master_district LIMIT 5');
    console.log('📍 Districts:');
    districts.forEach(d => {
      console.log(`- Code: ${d.district_code}, LGD: ${d.lgd_district_code}, Name: ${d.district_name}`);
    });

    // Check blocks
    const [blocks] = await sequelize.query('SELECT block_code, lgd_block_code, block_name FROM master_block LIMIT 5');
    console.log('\n🏘️ Blocks:');
    blocks.forEach(b => {
      console.log(`- Code: ${b.block_code}, LGD: ${b.lgd_block_code}, Name: ${b.block_name}`);
    });

    // Check plants
    const [plants] = await sequelize.query('SELECT id, name FROM master_plant LIMIT 5');
    console.log('\n🌱 Plants:');
    plants.forEach(p => {
      console.log(`- ID: ${p.id}, Name: ${p.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkMasterData();
