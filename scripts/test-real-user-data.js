const axios = require('axios');

async function testWithRealUserData() {
  try {
    console.log('🔐 Testing with real user data...\n');

    // Try logging in with hospital user
    console.log('1. Testing hospital login...');
    const hospitalResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      userId: 'H003',
      password: 'hospital123',
      loginType: 'api'
    });
    
    if (hospitalResponse.status === 200) {
      console.log('✅ Hospital login successful');
      const token = hospitalResponse.data.data.token;
      console.log(`👤 User: ${hospitalResponse.data.data.user.name}`);
      
      // Test mothers API
      const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`📊 Mothers API: ${mothersResponse.status} - Found ${mothersResponse.data.data?.mothers?.length || 0} mothers`);
      
      if (mothersResponse.data.data?.mothers?.length > 0) {
        const firstMother = mothersResponse.data.data.mothers[0];
        console.log(`\n2. Testing with mother: ${firstMother.mother_name} (${firstMother.mother_mobile})`);
        
        // Check if this mother has plant assignments
        const progressResponse = await axios.get(`http://localhost:3000/api/v1/mothers/${firstMother.id}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`📊 Progress API: ${progressResponse.status}`);
        console.log(`🌱 Plant assignments: ${progressResponse.data.data?.progress?.length || 0}`);
        
        // If no assignments, let's create some by assigning plants
        if (!progressResponse.data.data?.progress?.length) {
          console.log('\n3. Creating plant assignments for testing...');
          try {
            const assignResponse = await axios.post('http://localhost:3000/api/v1/assign-plants', {
              child_id: firstMother.id,
              plant_ids: [1, 2, 3, 4, 5] // Assign 5 plants
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Plant assignment: ${assignResponse.status}`);
          } catch (assignError) {
            console.log(`❌ Plant assignment error: ${assignError.response?.status} - ${assignError.response?.data?.message}`);
          }
        }
      }
      
      // Now test mother login
      console.log('\n4. Testing mother login...');
      try {
        const motherResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
          userId: 'M9876543210',
          password: 'mother123',
          loginType: 'api'
        });
        
        if (motherResponse.status === 200) {
          console.log('✅ Mother login successful');
          const motherToken = motherResponse.data.data.token;
          
          // Test mother tracking APIs
          console.log('\n5. Testing mother tracking APIs...');
          try {
            const trackingResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
              headers: { Authorization: `Bearer ${motherToken}` }
            });
            console.log(`✅ Plant tracking list: ${trackingResponse.status}`);
            console.log(`📊 Response:`, JSON.stringify(trackingResponse.data, null, 2));
          } catch (trackingError) {
            console.log(`❌ Plant tracking error: ${trackingError.response?.status} - ${trackingError.response?.data?.message}`);
          }
        }
      } catch (motherLoginError) {
        console.log(`❌ Mother login error: ${motherLoginError.response?.status} - ${motherLoginError.response?.data?.message}`);
        console.log('🔄 Trying default password...');
        
        try {
          const motherResponse2 = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'password123',
            loginType: 'api'
          });
          console.log('✅ Mother login successful with default password');
          const motherToken = motherResponse2.data.data.token;
          
          // Test mother tracking APIs
          const trackingResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
            headers: { Authorization: `Bearer ${motherToken}` }
          });
          console.log(`✅ Plant tracking list: ${trackingResponse.status}`);
          console.log(`📊 Response:`, JSON.stringify(trackingResponse.data, null, 2));
        } catch (error2) {
          console.log(`❌ Still failed: ${error2.response?.data?.message}`);
        }
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
  
  console.log('\n🏁 Test completed');
}

testWithRealUserData();
