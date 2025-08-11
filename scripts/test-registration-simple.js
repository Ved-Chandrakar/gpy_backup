const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({status: res.statusCode, data: parsed});
          }
        } catch (error) {
          reject({status: res.statusCode, data: responseData});
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testMotherRegistration() {
  try {
    console.log('🧪 Testing mother registration API...');
    
    // First, login to get JWT token
    console.log('🔐 Logging in...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = JSON.stringify({
      userId: 'H001',
      password: 'password123',
      loginType: 'web'
    });
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('🔍 Full login response:', JSON.stringify(loginResponse, null, 2));
    const token = loginResponse.data?.token || loginResponse.token;
    console.log('✅ Login successful');
    console.log('🔑 Token received:', token ? token.substring(0, 50) + '...' : 'No token');
    
    // Test mother registration
    console.log('👶 Testing mother registration...');
    
    const registrationOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/hospital/new-mother-registration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const registrationData = JSON.stringify({
      mother_name: 'Test Mother',
      father_husband_name: 'Test Father',
      mobile_number: '9876543210',
      delivery_date: '2024-01-15',
      delivery_type: 'normal',
      blood_group: 'O+',
      district_lgd_code: 375,
      block_lgd_code: 3604,
      child_gender: 'female',
      plants: [9, 10]
    });
    
    const response = await makeRequest(registrationOptions, registrationData);
    
    console.log('✅ Mother registration successful!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.status || 'Unknown error');
    if (error.data) {
      console.log('Response data:', JSON.stringify(error.data, null, 2));
    } else {
      console.log('Error:', error.message || error);
    }
  }
}

testMotherRegistration();
