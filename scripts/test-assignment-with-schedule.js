const axios = require('axios');

async function testPlantAssignmentWithSchedule() {
    try {
        console.log('🧪 Testing Plant Assignment with Auto-Schedule Generation...');
        
        // Login as hospital admin
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'H001',
            password: 'password123',
            loginType: 'hospital'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Hospital login successful');
        
        // Get list of mothers
        const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const mothers = mothersResponse.data.data.mothers;
        console.log('👩 Found', mothers.length, 'mothers');
        
        // Get list of plants
        const plantsResponse = await axios.get('http://localhost:3000/api/v1/plants', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const plants = plantsResponse.data.data.plants;
        console.log('🌱 Found', plants.length, 'plants');
        
        if (mothers.length > 0 && plants.length > 0) {
            const mother = mothers[0];
            const selectedPlants = plants.slice(0, Math.min(3, plants.length)); // Assign up to 3 plants
            
            console.log(`🎯 Assigning ${selectedPlants.length} plants to mother: ${mother.name}`);
            
            // Assign plants
            for (const plant of selectedPlants) {
                try {
                    console.log(`🌱 Assigning plant: ${plant.plant_name || plant.name || 'Unknown Plant'}`);
                    
                    const assignResponse = await axios.post('http://localhost:3000/api/v1/plants/assign', {
                        mother_id: mother.id,
                        plant_id: plant.id,
                        quantity: 1,
                        remarks: 'Test assignment with auto-schedule generation'
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (assignResponse.data.success) {
                        console.log('✅ Plant assigned successfully');
                        
                        // Check if schedule was generated
                        const assignmentId = assignResponse.data.data.assignment?.id;
                        if (assignmentId) {
                            console.log(`📅 Assignment ID: ${assignmentId} - Schedule should be auto-generated`);
                        }
                    }
                } catch (assignError) {
                    console.log('❌ Plant assignment failed:', assignError.response?.data?.message || assignError.message);
                }
            }
            
            // Now test the mother tracking APIs
            console.log('\n🔍 Testing Mother Tracking APIs...');
            
            try {
                // Test tracking list API (using hospital token for demo)
                const trackingListResponse = await axios.get(`http://localhost:3000/api/v1/mother/plants?mother_id=${mother.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (trackingListResponse.data.success) {
                    const plantList = trackingListResponse.data.data.plants;
                    console.log('✅ Plant tracking list retrieved successfully');
                    console.log(`📊 Mother has ${plantList.length} plants with tracking schedules`);
                    
                    if (plantList.length > 0) {
                        const firstPlant = plantList[0];
                        console.log('📋 First plant details:', {
                            plant_name: firstPlant.plant_name,
                            total_uploads_required: firstPlant.total_uploads_required,
                            completed_uploads: firstPlant.completed_uploads,
                            next_due_date: firstPlant.next_due_date,
                            days_remaining: firstPlant.days_remaining,
                            status: firstPlant.status
                        });
                        
                        // Test plant details API
                        const assignmentId = firstPlant.assignment_id;
                        const detailsResponse = await axios.get(`http://localhost:3000/api/v1/mother/plants/${assignmentId}/details?mother_id=${mother.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (detailsResponse.data.success) {
                            console.log('✅ Plant details retrieved successfully');
                            const schedules = detailsResponse.data.data.tracking_schedules;
                            console.log(`📅 Found ${schedules.length} tracking schedules for this plant`);
                            
                            if (schedules.length > 0) {
                                console.log('📋 First 3 schedules:');
                                schedules.slice(0, 3).forEach((schedule, index) => {
                                    console.log(`   ${index + 1}. Week ${schedule.week_number}, Month ${schedule.month_number}, Due: ${schedule.due_date}, Status: ${schedule.upload_status}`);
                                });
                            }
                        }
                    }
                }
            } catch (trackingError) {
                console.log('❌ Tracking API test failed:', trackingError.response?.data?.message || trackingError.message);
            }
        }
        
        console.log('\n🎉 Plant assignment and tracking system test completed!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

testPlantAssignmentWithSchedule();
