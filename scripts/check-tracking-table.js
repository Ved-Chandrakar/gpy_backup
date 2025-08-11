const db = require('../models');

async function checkTrackingTable() {
    try {
        console.log('🔍 Checking PlantTrackingSchedule table...');
        
        // Check if table exists by trying to query it
        const result = await db.PlantTrackingSchedule.findAndCountAll({ 
            limit: 1
        });
        
        console.log('✅ Table exists! Row count:', result.count);
        
        if (result.count > 0) {
            console.log('📋 Sample record:', JSON.stringify(result.rows[0], null, 2));
        }
        
        // Check table structure
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('tbl_plant_tracking_schedule');
        console.log('🏗️ Table structure:', Object.keys(tableInfo));
        
    } catch (error) {
        console.log('❌ Table check failed:', error.message);
        
        if (error.message.includes('does not exist') || error.message.includes('doesn\'t exist')) {
            console.log('🔧 Creating table...');
            try {
                await db.sequelize.sync({ force: false });
                console.log('✅ Table created successfully!');
                
                // Verify creation
                const verifyResult = await db.PlantTrackingSchedule.findAndCountAll({ limit: 1 });
                console.log('✅ Verification successful! Table is ready.');
            } catch (syncError) {
                console.log('❌ Table creation failed:', syncError.message);
            }
        }
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

checkTrackingTable();
