const db = require('../models');

async function debugMotherData() {
    try {
        console.log('🔍 Debugging mother data step by step...');
        
        // Step 1: Check mother user
        const mother = await db.User.findOne({ where: { userid: 'M9876543210' } });
        if (!mother) {
            console.log('❌ Mother user not found');
            return;
        }
        console.log('✅ Found mother user:', {
            id: mother.id,
            name: mother.name,
            mobile: mother.mobile,
            role_id: mother.role_id
        });
        
        // Step 2: Check if child exists with this mother's mobile
        const motherMobile = mother.mobile || mother.userid;
        console.log('🔍 Looking for child with mother_mobile:', motherMobile);
        
        const child = await db.Child.findOne({
            where: { mother_mobile: motherMobile }
        });
        
        if (!child) {
            console.log('❌ No child found with mother_mobile:', motherMobile);
            
            // Check what child records exist
            const allChildren = await db.Child.findAll({ limit: 5 });
            console.log('📊 Available children:');
            allChildren.forEach((c, i) => {
                console.log(`  ${i + 1}. Child ID: ${c.id}, Mother: ${c.mother_name}, Mobile: ${c.mother_mobile}`);
            });
            return;
        }
        
        console.log('✅ Found child:', {
            id: child.id,
            child_name: child.child_name,
            mother_name: child.mother_name,
            mother_mobile: child.mother_mobile
        });
        
        // Step 3: Check plant assignments for this child
        const assignments = await db.PlantAssignment.findAll({
            where: { 
                child_id: child.id,
                status: 'active'
            }
        });
        
        console.log(`🌱 Found ${assignments.length} plant assignments for this child`);
        
        if (assignments.length === 0) {
            console.log('ℹ️ No plant assignments found. This explains why the API returns empty.');
            
            // Create a test assignment to verify the system works
            console.log('🧪 Creating test plant assignment...');
            
            const plants = await db.Plant.findAll({ limit: 1 });
            if (plants.length > 0) {
                const testAssignment = await db.PlantAssignment.create({
                    child_id: child.id,
                    plant_id: plants[0].id,
                    assigned_by: 1, // Use a valid user ID
                    status: 'active'
                });
                
                console.log('✅ Created test assignment:', testAssignment.id);
                
                // Generate tracking schedule
                const plantTrackingUtils = require('../utils/plantTrackingUtils');
                await plantTrackingUtils.generateTrackingSchedule(testAssignment.id, new Date());
                console.log('✅ Generated tracking schedule');
                
                console.log('🎯 Now the mother API should work!');
            }
        } else {
            assignments.forEach((assignment, i) => {
                console.log(`  ${i + 1}. Assignment ID: ${assignment.id}, Plant ID: ${assignment.plant_id}, Status: ${assignment.status}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Debug failed:', error.message);
        console.log('Error details:', error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

debugMotherData();
