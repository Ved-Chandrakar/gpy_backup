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

async function testMotherLogin() {
  try {
    console.log('🧪 Testing mother login with mobile number as userid...');
    
    // Test mother login using mobile number as userid
    console.log('🔐 Testing mother login...');
    
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
      userId: '7777777777',      // Mobile number as userid
      password: '7777777777',    // Mobile number as password  
      loginType: 'mobile'        // Mobile app login
    });
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    
    console.log('✅ Mother login successful!');
    console.log('📋 Login Response:');
    console.log('   UserID:', loginResponse.data.user.userid);
    console.log('   Name:', loginResponse.data.user.name);
    console.log('   Mobile:', loginResponse.data.user.mobile);
    console.log('   Role:', loginResponse.data.user.role.name);
    console.log('   Password Changed:', loginResponse.data.user.is_password_changed);
    
    console.log('\n🎯 Full Response:');
    console.log(JSON.stringify(loginResponse, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.status || 'Unknown error');
    if (error.data) {
      console.log('Response data:', JSON.stringify(error.data, null, 2));
    } else {
      console.log('Error:', error.message || error);
    }
  }
}

testMotherLogin();
