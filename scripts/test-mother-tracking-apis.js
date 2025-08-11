const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testMotherPlantTrackingAPIs() {
  try {
    console.log('🌱 Testing Mother Plant Tracking APIs...\n');

    // First, let's check what authentication method works for mothers
    console.log('1. Testing mother authentication methods...');
    
    // We'll need to register/login as a hospital first to create mother data
    const hospitalLogin = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: 'hospital1',
      password: 'hospital123'
    });
    
    if (hospitalLogin.status === 200) {
      console.log('✅ Hospital login successful');
      const hospitalToken = hospitalLogin.data.data.token;
      
      // Check if we have any mothers registered
      const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      });
      
      console.log(`📊 Found ${mothersResponse.data.data?.mothers?.length || 0} mothers`);
      
      if (mothersResponse.data.data?.mothers?.length > 0) {
        const firstMother = mothersResponse.data.data.mothers[0];
        console.log(`📱 Testing with mother: ${firstMother.mother_name} (${firstMother.mother_mobile})`);
        
        // Try to test mother APIs using hospital token for now
        console.log('\n2. Testing mother plant tracking list...');
        try {
          const trackingListResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
            headers: { Authorization: `Bearer ${hospitalToken}` }
          });
          console.log(`✅ Plant tracking list: ${trackingListResponse.status}`);
          console.log(`📊 Response:`, trackingListResponse.data);
        } catch (error) {
          console.log(`❌ Plant tracking list error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
        
        // Check if this mother has any plant assignments
        const progressResponse = await axios.get(`http://localhost:3000/api/v1/mothers/${firstMother.id}/progress`, {
          headers: { Authorization: `Bearer ${hospitalToken}` }
        });
        
        if (progressResponse.data.data?.progress?.length > 0) {
          const firstAssignment = progressResponse.data.data.progress[0];
          console.log(`\n3. Testing plant details for assignment ${firstAssignment.id}...`);
          
          try {
            const detailsResponse = await axios.get(`http://localhost:3000/api/v1/mother/plants/${firstAssignment.id}/details`, {
              headers: { Authorization: `Bearer ${hospitalToken}` }
            });
            console.log(`✅ Plant details: ${detailsResponse.status}`);
            console.log(`📊 Response:`, detailsResponse.data);
          } catch (error) {
            console.log(`❌ Plant details error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
          }
        } else {
          console.log('⚠️  No plant assignments found for testing');
        }
      } else {
        console.log('⚠️  No mothers found for testing');
      }
    } else {
      console.log('❌ Hospital login failed');
    }

  } catch (error) {
    console.log('❌ Error testing mother APIs:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Mother plant tracking test completed');
}

testMotherPlantTrackingAPIs();
