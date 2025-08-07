const axios = require('axios');

async function debugMothersAPI() {
  try {
    console.log('🔍 Debugging mothers API...\n');

    // Login with working credentials
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      userId: 'H001',
      password: 'password123',
      loginType: 'api'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    
    // Test mothers API with detailed error logging
    try {
      const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Mothers API: ${mothersResponse.status}`);
      console.log(`📊 Response:`, mothersResponse.data);
    } catch (mothersError) {
      console.log(`❌ Mothers API error: ${mothersError.response?.status}`);
      console.log(`❌ Error details:`, mothersError.response?.data);
      
      // The error might be in the controller, let's check server logs
      console.log('\n🔍 Check server terminal for detailed error logs...');
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
  
  console.log('\n🏁 Debug completed');
}

debugMothersAPI();
