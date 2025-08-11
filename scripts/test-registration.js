const axios = require('axios');
const FormData = require('form-data');

async function testMotherRegistration() {
  try {
    console.log('🧪 Testing mother registration API...');
    
    // First, login to get JWT token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      userid: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test mother registration
    console.log('👶 Testing mother registration...');
    
    const registrationData = {
      mother_name: 'Test Mother',
      father_husband_name: 'Test Father',
      mobile_number: '9876543210',
      delivery_date: '2024-01-15',
      delivery_type: 'normal',
      blood_group: 'O+',
      district_lgd_code: 7,
      block_lgd_code: 5,
      child_gender: 'female',
      plants: [1, 2]
    };
    
    const response = await axios.post(
      'http://localhost:3000/api/v1/hospital/new-mother-registration',
      registrationData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Mother registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMotherRegistration();
