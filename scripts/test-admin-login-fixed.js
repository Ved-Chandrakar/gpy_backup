const axios = require('axios');

async function testAdminLogin() {
  try {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Testing admin login for state and hospital users...\n');
    
    // Test cases for different user types
    const testUsers = [
      {
        name: 'State User',
        mobile: 'CGSTATE001',
        password: 'gpy@2025'
      },
      {
        name: 'Hospital User', 
        mobile: 'CGCHC001',
        password: 'gpy@2025'
      }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n📋 Testing ${testUser.name} (${testUser.mobile}):`);
      
      try {
        // First get the login page to establish session
        console.log('  → Getting login page...');
        const loginPageResponse = await axios.get(`${baseURL}/admin/login`, {
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: (status) => status < 400
        });
        
        // Extract cookies for session
        const cookies = loginPageResponse.headers['set-cookie'] || [];
        const cookieHeader = cookies.join('; ');
        
        console.log('  → Attempting login...');
        
        // Submit login form
        const loginResponse = await axios.post(`${baseURL}/admin/login`, {
          mobile: testUser.mobile,
          password: testUser.password
        }, {
          headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: (status) => status < 400
        });
        
        console.log(`  → Login Response Status: ${loginResponse.status}`);
        console.log(`  → Login Response Headers:`, loginResponse.headers.location);
        
        if (loginResponse.status === 302) {
          const redirectLocation = loginResponse.headers.location;
          console.log(`  → Redirect to: ${redirectLocation}`);
          
          if (redirectLocation && redirectLocation.includes('/admin/dashboard')) {
            console.log('  ✅ SUCCESS: Redirected to dashboard');
            
            // Test accessing dashboard
            const allCookies = [
              ...cookies,
              ...(loginResponse.headers['set-cookie'] || [])
            ];
            const dashboardCookies = allCookies.join('; ');
            
            const dashboardResponse = await axios.get(`${baseURL}/admin/dashboard`, {
              headers: {
                'Cookie': dashboardCookies
              },
              withCredentials: true,
              maxRedirects: 0,
              validateStatus: (status) => status < 400
            });
            
            console.log(`  → Dashboard Access Status: ${dashboardResponse.status}`);
            
            if (dashboardResponse.status === 200) {
              console.log('  ✅ SUCCESS: Dashboard accessible');
            } else if (dashboardResponse.status === 302) {
              console.log(`  ❌ FAIL: Dashboard redirected to ${dashboardResponse.headers.location}`);
            }
            
          } else if (redirectLocation && redirectLocation.includes('/admin/login')) {
            console.log('  ❌ FAIL: Redirected back to login page');
          } else {
            console.log(`  ❓ UNKNOWN: Redirected to ${redirectLocation}`);
          }
        } else {
          console.log('  ❌ FAIL: No redirect response');
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`  ❌ ERROR: ${error.response.status} - ${error.response.statusText}`);
          if (error.response.status === 302) {
            console.log(`  → Redirect to: ${error.response.headers.location}`);
          }
        } else {
          console.log(`  ❌ ERROR: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
}

// Run the test
testAdminLogin();
