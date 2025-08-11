const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testStateLogin() {
  console.log('🔐 Testing State Administrator Login...');
  
  try {
    console.log('\n🧪 Testing CGSTATE001 login:');
    console.log('   UserID: CGSTATE001');
    console.log('   Password: gpy@2025');
    console.log('   LoginType: state');
    
    const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      userId: 'CGSTATE001',
      password: 'gpy@2025',
      loginType: 'state'
    });
    
    if (response.data.success) {
      console.log('   ✅ LOGIN SUCCESSFUL!');
      console.log(`   User ID: ${response.data.data.user.id}`);
      console.log(`   Name: ${response.data.data.user.name}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      console.log(`   UserID: ${response.data.data.user.userid}`);
      console.log(`   Hospital ID: ${response.data.data.user.hospital_id || 'N/A (State Level)'}`);
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      
      // Test if we can use the token for authenticated requests
      console.log('\n🧪 Testing authenticated request with token...');
      try {
        const profileResponse = await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
          headers: { Authorization: `Bearer ${response.data.data.token}` }
        });
        
        console.log('   ✅ Token works! Profile retrieved successfully');
        console.log(`   Profile Name: ${profileResponse.data.data.name}`);
        console.log(`   Profile Role: ${profileResponse.data.data.role}`);
      } catch (tokenError) {
        console.log('   ❌ Token test failed:', tokenError.response?.data?.message || tokenError.message);
      }
      
    } else {
      console.log('   ❌ LOGIN FAILED');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    console.log('   ❌ LOGIN FAILED');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log(`   Full Error Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n=== State Login Test Complete ===');
}

testStateLogin();
