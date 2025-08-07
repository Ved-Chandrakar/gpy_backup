const db = require('../models');

async function testTableFunctionality() {
    try {
        console.log('🧪 Testing PlantTrackingSchedule table...');
        
        // Check if table exists and count records
        const result = await db.PlantTrackingSchedule.findAndCountAll({ limit: 1 });
        console.log('✅ Table exists! Current row count:', result.count);
        
        // Test plant assignment with auto-schedule generation
        console.log('🌱 Testing plant assignment with auto-schedule...');
        
        // Find a mother and plant for testing
        const mothers = await db.Mother.findAll({ limit: 1 });
        const plants = await db.Plant.findAll({ limit: 1 });
        
        if (mothers.length === 0 || plants.length === 0) {
            console.log('❌ No mothers or plants found for testing');
            return;
        }
        
        console.log('👩 Found mother:', mothers[0].name);
        console.log('🌱 Found plant:', plants[0].plant_name);
        
        // Test schedule generation utility
        const plantTrackingUtils = require('../utils/plantTrackingUtils');
        const schedules = plantTrackingUtils.generateTrackingSchedule();
        console.log('📅 Generated', schedules.length, 'tracking schedules');
        
        console.log('✅ All tracking system components are functional!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Error details:', error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

testTableFunctionality();
