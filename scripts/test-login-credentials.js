const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testLoginCredentials() {
  console.log('🔐 Testing Login Credentials...');
  
  const credentialsToTest = [
    {
      userId: 'CGSTATE001',
      password: 'gpy@2025',
      loginType: 'state',
      description: 'State Administrator'
    },
    {
      userId: 'CGCHC001', 
      password: 'gpy@2025',
      loginType: 'hospital',
      description: 'Hospital User'
    }
  ];
  
  for (const cred of credentialsToTest) {
    try {
      console.log(`\n🧪 Testing ${cred.description}:`);
      console.log(`   UserID: ${cred.userId}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   LoginType: ${cred.loginType}`);
      
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        userId: cred.userId,
        password: cred.password,
        loginType: cred.loginType
      });
      
      if (response.data.success) {
        console.log('   ✅ LOGIN SUCCESSFUL');
        console.log(`   Name: ${response.data.data.user.name}`);
        console.log(`   Role: ${response.data.data.user.role}`);
        console.log(`   Hospital ID: ${response.data.data.user.hospital_id || 'N/A'}`);
      }
      
    } catch (error) {
      console.log('   ❌ LOGIN FAILED');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n=== Login Test Complete ===');
}

testLoginCredentials();
