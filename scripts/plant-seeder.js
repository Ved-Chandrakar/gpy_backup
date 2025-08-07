#!/usr/bin/env node

/**
 * Plant Seeder Script
 * 
 * This script removes all existing plants and adds the new plant list:
 * - Aam (Mango)
 * - Aamrud (Guava)  
 * - Aamla (Amla)
 * - Papita (Papaya)
 * - Munga (Drumstick)
 */

const { Plant } = require('../models');

// New plants to be added (using correct ENUM values: 'medicinal', 'fruit', 'flower', 'timber', 'other')
const newPlants = [
  {
    name: 'Aam',
    species: 'Mangifera indica',
    local_name: 'आम',
    category: 'fruit',
    description: 'Mango tree - A tropical fruit tree known for its sweet and juicy fruits',
    care_instructions: 'Requires well-drained soil, regular watering, and full sunlight. Prune regularly for better fruit production.',
    growth_period_months: 48,
    is_active: true
  },
  {
    name: 'Aamrud', 
    species: 'Psidium guajava',
    local_name: 'अमरूद',
    category: 'fruit',
    description: 'Guava tree - A tropical fruit tree with vitamin C rich fruits',
    care_instructions: 'Grows in various soil types, needs regular watering, and full to partial sunlight.',
    growth_period_months: 36,
    is_active: true
  },
  {
    name: 'Aamla',
    species: 'Phyllanthus emblica',
    local_name: 'आंवला', 
    category: 'medicinal',
    description: 'Indian Gooseberry - A medicinal fruit tree with numerous health benefits',
    care_instructions: 'Drought resistant, grows in poor soil, needs minimal care once established.',
    growth_period_months: 48,
    is_active: true
  },
  {
    name: 'Papita',
    species: 'Carica papaya',
    local_name: 'पपीता',
    category: 'fruit', 
    description: 'Papaya tree - Fast growing fruit tree with enzyme-rich fruits',
    care_instructions: 'Needs well-drained soil, regular watering, protection from strong winds.',
    growth_period_months: 12,
    is_active: true
  },
  {
    name: 'Munga',
    species: 'Moringa oleifera',
    local_name: 'मुनगा/सहजन',
    category: 'medicinal',
    description: 'Drumstick tree - A nutritious vegetable and medicinal tree',
    care_instructions: 'Very hardy, drought resistant, grows in poor soil with minimal care.',
    growth_period_months: 8,
    is_active: true
  }
];

async function replantDatabase() {
  try {
    console.log('🌱 Starting plant database reset...');
    console.log('=' .repeat(50));

    // Step 1: Remove all existing plants (safe approach)
    console.log('\n1. Removing all existing plants...');
    
    // First disable foreign key checks temporarily
    await Plant.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all plants
    const deletedCount = await Plant.destroy({
      where: {},
      force: true
    });
    
    // Re-enable foreign key checks
    await Plant.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`✅ Removed all existing plants (${deletedCount} records deleted)`);

    // Step 2: Add new plants
    console.log('\n2. Adding new plants...');
    const createdPlants = await Plant.bulkCreate(newPlants);
    
    console.log('✅ New plants added:');
    createdPlants.forEach((plant, index) => {
      console.log(`   ${index + 1}. ${plant.name} (${plant.local_name}) - ${plant.category}`);
    });

    // Step 3: Verify the new plants
    console.log('\n3. Verifying new plant data...');
    const allPlants = await Plant.findAll({
      attributes: ['id', 'name', 'local_name', 'category'],
      order: [['name', 'ASC']]
    });

    console.log('📊 Current plants in database:');
    allPlants.forEach(plant => {
      console.log(`   ID: ${plant.id}, Name: ${plant.name}, Local: ${plant.local_name}, Category: ${plant.category}`);
    });

    console.log('\n' + '=' .repeat(50));
    console.log(`✅ Plant database reset completed successfully!`);
    console.log(`📊 Total plants: ${allPlants.length}`);
    console.log('🌿 Ready for Green Paalna Yojna!');

  } catch (error) {
    console.error('❌ Plant seeding failed:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  replantDatabase()
    .then(() => {
      console.log('\n🎉 Plant seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Plant seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { replantDatabase, newPlants };
