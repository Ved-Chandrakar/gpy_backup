const { sequelize } = require('../config/database');

async function checkPlantsAndCreateTestData() {
  try {
    console.log('🔍 Checking plants and creating test data...\n');

    // Check available plants
    const [plants] = await sequelize.query('SELECT id, name, is_active FROM master_plant LIMIT 10');
    console.log('🌱 Available plants:');
    console.table(plants);

    // Check mother user credentials
    const [mothers] = await sequelize.query("SELECT userid, name, mobile FROM tbl_user WHERE role_id = 5");
    console.log('\n👩 Mother users:');
    console.table(mothers);

    // If no plants, create some test plants
    if (plants.length === 0) {
      console.log('\n🌱 Creating test plants...');
      const plantData = [
        { name: 'नीम', scientific_name: 'Azadirachta indica', category: 'medicinal', is_active: 1 },
        { name: 'तुलसी', scientific_name: 'Ocimum tenuiflorum', category: 'medicinal', is_active: 1 },
        { name: 'पीपल', scientific_name: 'Ficus religiosa', category: 'shade', is_active: 1 },
        { name: 'बरगद', scientific_name: 'Ficus benghalensis', category: 'shade', is_active: 1 },
        { name: 'आम', scientific_name: 'Mangifera indica', category: 'fruit', is_active: 1 }
      ];

      for (const plant of plantData) {
        await sequelize.query(
          'INSERT INTO master_plant (name, scientific_name, category, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: [plant.name, plant.scientific_name, plant.category, plant.is_active] }
        );
      }
      console.log('✅ Test plants created');
    }

    // Check final plant count
    const [finalPlants] = await sequelize.query('SELECT id, name, is_active FROM master_plant WHERE is_active = 1 LIMIT 5');
    console.log('\n🌱 Active plants for assignment:');
    console.table(finalPlants);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPlantsAndCreateTestData();
