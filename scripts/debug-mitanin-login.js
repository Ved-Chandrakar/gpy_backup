const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugLogin() {
  try {
    console.log('=== Debugging Mitanin Login ===\n');

    // Test different variations of login data
    const loginVariations = [
      {
        userId: 'mitanin001',
        password: 'mitanin001',
        loginType: 'mitanin'
      },
      {
        userId: '9876543001',  // Try with mobile as userid
        password: 'mitanin001',
        loginType: 'mitanin'
      }
    ];

    for (let i = 0; i < loginVariations.length; i++) {
      const loginData = loginVariations[i];
      console.log(`${i + 1}. Testing login with userId: ${loginData.userId}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        break;
      } catch (error) {
        console.log('❌ Login failed');
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Message:', error.response.data.message);
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLogin();
