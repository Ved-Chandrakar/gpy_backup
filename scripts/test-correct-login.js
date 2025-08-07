const axios = require('axios');

async function testCorrectLoginFormat() {
  try {
    console.log('🔐 Testing correct login format...\n');

    // Try different potential userids
    const testCredentials = [
      { userId: 'admin', password: 'admin123' },
      { userId: 'hospital1', password: 'hospital123' },
      { userId: 'test_hospital', password: 'password123' },
      { userId: '1', password: 'admin123' }
    ];

    for (const creds of testCredentials) {
      console.log(`🔍 Trying login with userId: ${creds.userId}`);
      try {
        const response = await axios.post('http://localhost:3000/api/v1/auth/login', creds);
        
        if (response.status === 200) {
          console.log(`✅ SUCCESS with ${creds.userId}`);
          console.log(`👤 User: ${response.data.data.user.name}`);
          console.log(`🏷️  Role: ${response.data.data.user.role}`);
          
          // Test mothers API with this token
          const token = response.data.data.token;
          try {
            const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`📊 Mothers API: ${mothersResponse.status} - Found ${mothersResponse.data.data?.mothers?.length || 0} mothers`);
          } catch (mothersError) {
            console.log(`❌ Mothers API error: ${mothersError.response?.status}`);
          }
          
          break; // Stop on first successful login
        }
      } catch (error) {
        console.log(`❌ Failed with ${creds.userId}: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
  
  console.log('\n🏁 Login test completed');
}

testCorrectLoginFormat();
