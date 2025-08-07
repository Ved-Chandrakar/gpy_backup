const db = require('../models');

async function debugDetailAPIQuery() {
    try {
        console.log('🔍 Debugging detail API query step by step...');
        
        const assignmentId = 22;
        const motherMobile = '9876543210';
        
        console.log('1️⃣ Testing basic assignment query...');
        const basicAssignment = await db.PlantAssignment.findOne({
            where: { id: assignmentId }
        });
        
        if (!basicAssignment) {
            console.log('❌ Assignment not found');
            return;
        }
        console.log('✅ Basic assignment found:', basicAssignment.id);
        
        console.log('\n2️⃣ Testing assignment with child...');
        const assignmentWithChild = await db.PlantAssignment.findOne({
            where: { id: assignmentId },
            include: [{
                model: db.Child,
                as: 'child',
                where: { mother_mobile: motherMobile }
            }]
        });
        
        if (!assignmentWithChild) {
            console.log('❌ Assignment with child not found');
            return;
        }
        console.log('✅ Assignment with child found');
        
        console.log('\n3️⃣ Testing assignment with plant...');
        const assignmentWithPlant = await db.PlantAssignment.findOne({
            where: { id: assignmentId },
            include: [{
                model: db.Plant,
                as: 'plant'
            }]
        });
        
        if (!assignmentWithPlant) {
            console.log('❌ Assignment with plant not found');
            return;
        }
        console.log('✅ Assignment with plant found');
        
        console.log('\n4️⃣ Testing assignment with tracking schedules...');
        const assignmentWithSchedules = await db.PlantAssignment.findOne({
            where: { id: assignmentId },
            include: [{
                model: db.PlantTrackingSchedule,
                as: 'trackingSchedules'
            }]
        });
        
        if (!assignmentWithSchedules) {
            console.log('❌ Assignment with schedules not found');
            return;
        }
        console.log('✅ Assignment with schedules found:', assignmentWithSchedules.trackingSchedules?.length || 0, 'schedules');
        
        console.log('\n5️⃣ Testing full query without photo...');
        const fullAssignmentNoPhoto = await db.PlantAssignment.findOne({
            where: { id: assignmentId },
            include: [
                {
                    model: db.Child,
                    as: 'child',
                    where: { mother_mobile: motherMobile }
                },
                {
                    model: db.Plant,
                    as: 'plant'
                },
                {
                    model: db.PlantTrackingSchedule,
                    as: 'trackingSchedules'
                }
            ]
        });
        
        if (!fullAssignmentNoPhoto) {
            console.log('❌ Full assignment query failed');
            return;
        }
        console.log('✅ Full assignment query (no photo) successful');
        
        console.log('\n6️⃣ Testing with photo include...');
        const fullAssignment = await db.PlantAssignment.findOne({
            where: { id: assignmentId },
            include: [
                {
                    model: db.Child,
                    as: 'child',
                    where: { mother_mobile: motherMobile }
                },
                {
                    model: db.Plant,
                    as: 'plant'
                },
                {
                    model: db.PlantTrackingSchedule,
                    as: 'trackingSchedules',
                    include: [{
                        model: db.PlantPhoto,
                        as: 'photo',
                        required: false
                    }]
                }
            ]
        });
        
        if (!fullAssignment) {
            console.log('❌ Full assignment query with photo failed');
            return;
        }
        console.log('✅ Full assignment query with photo successful');
        
        console.log('\n🎉 All queries successful! The detail API should work.');
        
    } catch (error) {
        console.log('❌ Debug failed:', error.message);
        console.log('Error details:', error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

debugDetailAPIQuery();
