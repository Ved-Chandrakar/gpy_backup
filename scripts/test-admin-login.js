const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAdminLogin() {
  console.log('🔐 Testing Admin Panel Login...');
  
  try {
    // First, get the login page to check if it's accessible
    console.log('\n1. Checking admin login page...');
    try {
      const loginPageResponse = await axios.get(`${BASE_URL}/admin/login`);
      console.log('   ✅ Admin login page accessible');
      console.log(`   Status: ${loginPageResponse.status}`);
    } catch (error) {
      console.log('   ❌ Admin login page not accessible');
      console.log(`   Error: ${error.message}`);
      return;
    }
    
    // Test admin login with CGSTATE001
    console.log('\n2. Testing admin login with CGSTATE001...');
    
    // Create a session to handle cookies and redirects
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      maxRedirects: 0, // Don't follow redirects automatically
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects as success
      }
    });
    
    try {
      const loginResponse = await axiosInstance.post('/admin/login', {
        mobile: 'CGSTATE001',
        password: 'gpy@2025'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [function (data) {
          return Object.keys(data).map(key => 
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
          ).join('&');
        }]
      });
      
      console.log('   ✅ Admin login request sent successfully');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Headers: ${JSON.stringify(loginResponse.headers, null, 2)}`);
      
      // Check if redirected to dashboard
      if (loginResponse.status === 302 || loginResponse.status === 301) {
        const location = loginResponse.headers.location;
        console.log(`   Redirect Location: ${location}`);
        
        if (location && location.includes('/admin/dashboard')) {
          console.log('   ✅ Successfully redirected to admin dashboard');
        } else if (location && location.includes('/admin/login')) {
          console.log('   ❌ Redirected back to login page - login failed');
        } else {
          console.log(`   ⚠️  Redirected to unknown location: ${location}`);
        }
      }
      
    } catch (error) {
      console.log('   ❌ Admin login failed');
      console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
      console.log(`   Response: ${error.response?.data}`);
    }
    
    // Test with hospital user as well
    console.log('\n3. Testing admin login with CGCHC001...');
    try {
      const hospitalLoginResponse = await axiosInstance.post('/admin/login', {
        mobile: 'CGCHC001',
        password: 'gpy@2025'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [function (data) {
          return Object.keys(data).map(key => 
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
          ).join('&');
        }]
      });
      
      console.log('   ✅ Hospital admin login request sent successfully');
      console.log(`   Status: ${hospitalLoginResponse.status}`);
      
      if (hospitalLoginResponse.status === 302 || hospitalLoginResponse.status === 301) {
        const location = hospitalLoginResponse.headers.location;
        console.log(`   Redirect Location: ${location}`);
        
        if (location && location.includes('/admin/dashboard')) {
          console.log('   ✅ Successfully redirected to admin dashboard');
        } else {
          console.log('   ❌ Login may have failed');
        }
      }
      
    } catch (error) {
      console.log('   ❌ Hospital admin login failed');
      console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n=== Admin Login Test Complete ===');
}

testAdminLogin();
