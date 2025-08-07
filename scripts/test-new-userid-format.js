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

async function testNewUseridFormat() {
  try {
    console.log('🧪 Testing new userid format (mobile number only)...');
    
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
    const token = loginResponse.data?.token || loginResponse.token;
    console.log('✅ Login successful');
    
    // Test mother registration with new mobile number
    console.log('👶 Testing mother registration with new userid format...');
    
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
    
    const newMobileNumber = '7777777777'; // Different number to create new user
    const registrationData = JSON.stringify({
      mother_name: 'Test Mother New',
      father_husband_name: 'Test Father New',
      mobile_number: newMobileNumber,
      delivery_date: '2024-02-15',
      delivery_type: 'normal',
      blood_group: 'A+',
      district_lgd_code: 375,
      block_lgd_code: 3604,
      child_gender: 'male',
      plants: [9, 10]
    });
    
    const response = await makeRequest(registrationOptions, registrationData);
    
    console.log('✅ Mother registration successful!');
    console.log('📋 Login Credentials:');
    console.log('   UserID:', response.data.login_credentials.userid);
    console.log('   Password:', response.data.login_credentials.default_password);
    
    // Verify the userid is just the mobile number
    if (response.data.login_credentials.userid === newMobileNumber) {
      console.log('✅ SUCCESS: UserID is now the mobile number directly!');
    } else {
      console.log('❌ FAIL: UserID is not the mobile number');
    }
    
    console.log('\n🎯 Complete Response:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.status || 'Unknown error');
    if (error.data) {
      console.log('Response data:', JSON.stringify(error.data, null, 2));
    } else {
      console.log('Error:', error.message || error);
    }
  }
}

testNewUseridFormat();
