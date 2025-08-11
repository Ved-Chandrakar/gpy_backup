/**
 * Simple check of mother data and plant assignments
 */

require('dotenv').config();
const { Child, PlantAssignment, Plant } = require('../models');

const checkMotherData = async () => {
  try {
    console.log('🔍 Checking mother-child relationships...\n');
    
    // Get all children
    const children = await Child.findAll({
      attributes: ['id', 'mother_name', 'mother_mobile'],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Found ${children.length} children in database:`);
    children.forEach((child, index) => {
      console.log(`${index + 1}. Child ID: ${child.id}, Mother: ${child.mother_name}, Mobile: ${child.mother_mobile}`);
    });
    
    // Check plant assignments
    console.log('\n🌱 Checking plant assignments...');
    const assignments = await PlantAssignment.findAll({
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['mother_name', 'mother_mobile']
        },
        {
          model: Plant,
          as: 'plant',
          attributes: ['name']
        }
      ]
    });
    
    console.log(`📊 Found ${assignments.length} plant assignments:`);
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. Assignment ID: ${assignment.id}, Mother: ${assignment.child.mother_name} (${assignment.child.mother_mobile}), Plant: ${assignment.plant.name}`);
    });
    
    // Check specifically for test mother
    console.log('\n🎯 Checking for test mother (9876543210)...');
    const testMother = await Child.findOne({
      where: { mother_mobile: '9876543210' }
    });
    
    if (testMother) {
      console.log(`✅ Test mother found: ${testMother.mother_name}`);
      
      // Check her assignments
      const testAssignments = await PlantAssignment.findAll({
        where: { child_id: testMother.id }
      });
      console.log(`📊 Test mother has ${testAssignments.length} plant assignments`);
    } else {
      console.log('❌ Test mother (9876543210) not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkMotherData();
