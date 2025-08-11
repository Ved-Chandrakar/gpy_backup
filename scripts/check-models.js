const db = require('../models');

async function checkModels() {
    try {
        console.log('🔍 Checking available models...');
        console.log('Available models:', Object.keys(db));
        
        // Test PlantTrackingSchedule table
        const result = await db.PlantTrackingSchedule.findAndCountAll({ limit: 1 });
        console.log('✅ PlantTrackingSchedule table exists! Row count:', result.count);
        
        // Test User model instead of Mother
        const users = await db.User.findAll({ 
            where: { role_id: 3 }, // Mother role
            limit: 1 
        });
        console.log('👩 Found mothers in User table:', users.length);
        
        if (users.length > 0) {
            console.log('Mother details:', {
                id: users[0].id,
                name: users[0].name,
                mobile: users[0].mobile
            });
        }
        
        // Test Plant model
        const plants = await db.Plant.findAll({ limit: 1 });
        console.log('🌱 Found plants:', plants.length);
        
        if (plants.length > 0) {
            console.log('Plant details:', {
                id: plants[0].id,
                name: plants[0].plant_name
            });
        }
        
        console.log('✅ Basic model functionality verified!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

checkModels();
