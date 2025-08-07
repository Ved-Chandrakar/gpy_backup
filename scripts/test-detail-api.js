const axios = require('axios');

async function testDetailAPI() {
    try {
        console.log('🔍 Testing Mother Plant Detail API...');
        
        // Step 1: Mother login
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'mother123',
            loginType: 'mother'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Mother login successful');
        
        // Step 2: Get plant list first to get assignment IDs
        console.log('\n📋 Getting plant list to find assignment IDs...');
        try {
            const plantsResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (plantsResponse.data.success) {
                const plants = plantsResponse.data.data.plants;
                console.log(`✅ Found ${plants.length} plant assignments`);
                
                if (plants.length === 0) {
                    console.log('ℹ️ No plant assignments found. Creating test assignment...');
                    
                    // Create test assignment to test detail API
                    const db = require('../models');
                    
                    // Find mother's child
                    const mother = await db.User.findOne({ where: { userid: 'M9876543210' } });
                    const child = await db.Child.findOne({ where: { mother_mobile: mother.mobile } });
                    const plant = await db.Plant.findOne();
                    const hospital = await db.User.findOne({ where: { role_id: 3 } }); // Hospital user
                    
                    if (child && plant && hospital) {
                        console.log('🌱 Creating test plant assignment...');
                        const assignment = await db.PlantAssignment.create({
                            child_id: child.id,
                            plant_id: plant.id,
                            assigned_by: hospital.id,
                            status: 'active'
                        });
                        
                        // Generate tracking schedule
                        const plantTrackingUtils = require('../utils/plantTrackingUtils');
                        await plantTrackingUtils.generateTrackingSchedule(assignment.id, new Date());
                        
                        console.log(`✅ Created test assignment ID: ${assignment.id}`);
                        
                        // Now test the detail API
                        await testDetailAPIWithAssignment(token, assignment.id);
                    } else {
                        console.log('❌ Missing required data for test assignment');
                    }
                    
                    await db.sequelize.close();
                    
                } else {
                    // Test with first assignment
                    const firstPlant = plants[0];
                    await testDetailAPIWithAssignment(token, firstPlant.assignment_id);
                }
                
            } else {
                console.log('❌ Plant list API failed:', plantsResponse.data.message);
            }
        } catch (listError) {
            console.log('❌ Plant list API error:', listError.response?.data?.message || listError.message);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

async function testDetailAPIWithAssignment(token, assignmentId) {
    console.log(`\n🔍 Testing detail API with assignment ID: ${assignmentId}`);
    
    try {
        const detailResponse = await axios.get(`http://localhost:3000/api/v1/mother/plants/${assignmentId}/details`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (detailResponse.data.success) {
            console.log('✅ Detail API working!');
            console.log('📊 Response data:', JSON.stringify(detailResponse.data.data, null, 2));
        } else {
            console.log('❌ Detail API failed:', detailResponse.data.message);
        }
        
    } catch (detailError) {
        console.log('❌ Detail API error:');
        console.log('   Status:', detailError.response?.status);
        console.log('   Message:', detailError.response?.data?.message || detailError.message);
        
        if (detailError.response?.status === 404) {
            console.log('   ℹ️ This might be because the assignment doesn\'t belong to this mother');
        } else if (detailError.response?.status === 500) {
            console.log('   ℹ️ Server error - checking controller implementation...');
        }
    }
}

testDetailAPI();
