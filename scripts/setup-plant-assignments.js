/**
 * Check and Create Plant Assignments for Testing Mother Plants API
 */

require('dotenv').config();
const { Child, PlantAssignment, Plant, PlantTrackingSchedule } = require('../models');
const { generateTrackingSchedule } = require('../utils/plantTrackingUtils');

const setupPlantAssignments = async () => {
  try {
    console.log('🔍 Checking existing plant assignments...\n');
    
    // Check existing assignments
    const existingAssignments = await PlantAssignment.findAll({
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'mother_name', 'mother_mobile']
        },
        {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log(`📊 Found ${existingAssignments.length} existing plant assignments`);
    
    if (existingAssignments.length > 0) {
      console.log('\n📋 Existing assignments:');
      existingAssignments.forEach((assignment, index) => {
        console.log(`${index + 1}. Mother: ${assignment.child.mother_name} (${assignment.child.mother_mobile}) - Plant: ${assignment.plant.name} - Status: ${assignment.status}`);
      });
    }
    
    // Get all children (mothers) created through hospital registration
    const children = await Child.findAll({
      attributes: ['id', 'mother_name', 'mother_mobile'],
      order: [['created_at', 'DESC']],
      limit: 5 // Get recent ones
    });
    
    console.log(`\n👥 Found ${children.length} children/mothers in database`);
    
    if (children.length === 0) {
      console.log('❌ No children found. Please run hospital registration test first.');
      return;
    }
    
    // Get available plants
    const plants = await Plant.findAll({
      attributes: ['id', 'name'],
      limit: 3 // Get first 3 plants
    });
    
    console.log(`\n🌱 Found ${plants.length} plants available for assignment`);
    
    if (plants.length === 0) {
      console.log('❌ No plants found in database.');
      return;
    }
    
    // Create plant assignments for children who don't have any
    let assignmentsCreated = 0;
    
    for (const child of children) {
      // Check if this child already has assignments
      const hasAssignments = existingAssignments.some(a => a.child.id === child.id);
      
      if (!hasAssignments) {
        console.log(`\n🌿 Creating plant assignments for ${child.mother_name} (${child.mother_mobile})...`);
        
        // Assign 2 plants to each mother
        // Get a hospital user to use as assigner
        const { User } = require('../models');
        const hospitalUser = await User.findOne({
          where: { role_id: 3 }, // Hospital role (corrected from 4 to 3)
          attributes: ['id']
        });
        
        if (!hospitalUser) {
          console.log('❌ No hospital user found to assign plants');
          continue;
        }
        
        for (let i = 0; i < Math.min(2, plants.length); i++) {
          const plant = plants[i];
          
          const assignment = await PlantAssignment.create({
            child_id: child.id,
            plant_id: plant.id,
            assigned_date: new Date().toISOString().split('T')[0],
            assigned_by: hospitalUser.id,
            status: 'active'
          });
          
          // Generate tracking schedule for this assignment
          await generateTrackingSchedule(assignment.id, assignment.assigned_date);
          
          console.log(`   ✅ Assigned plant: ${plant.name} (Assignment ID: ${assignment.id})`);
          assignmentsCreated++;
        }
      }
    }
    
    if (assignmentsCreated > 0) {
      console.log(`\n🎉 Created ${assignmentsCreated} new plant assignments with tracking schedules!`);
    } else {
      console.log('\n📝 All mothers already have plant assignments.');
    }
    
    // Show final summary
    console.log('\n📊 Final Summary:');
    const totalAssignments = await PlantAssignment.count({ where: { status: 'active' } });
    const totalSchedules = await PlantTrackingSchedule.count();
    
    console.log(`   Active Plant Assignments: ${totalAssignments}`);
    console.log(`   Total Tracking Schedules: ${totalSchedules}`);
    
    console.log('\n✅ Plant assignment setup completed!');
    console.log('💡 Now you can test the mother plants API.');
    
  } catch (error) {
    console.error('❌ Error setting up plant assignments:', error);
  }
};

setupPlantAssignments().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
