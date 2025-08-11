const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test login to see the response format
const loginData = {
  userId: '9876543210',
  password: '9876543210',
  loginType: 'mother'
};

async function testLogin() {
  try {
    console.log('Testing login response format...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();
