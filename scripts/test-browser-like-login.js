const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Create axios instance with cookie support
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({
  jar: cookieJar,
  withCredentials: true
}));

async function testBrowserLikeLogin() {
  try {
    const baseURL = 'http://localhost:3001';
    
    console.log('🧪 Testing browser-like admin login flow...\n');
    
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
        // Step 1: Get the login page
        console.log('  → Getting login page...');
        const loginPageResponse = await client.get(`${baseURL}/admin/login`);
        console.log(`  → Login page status: ${loginPageResponse.status}`);
        
        // Step 2: Submit login form using application/x-www-form-urlencoded
        console.log('  → Submitting login form...');
        const loginData = new URLSearchParams();
        loginData.append('mobile', testUser.mobile);
        loginData.append('password', testUser.password);
        
        const loginResponse = await client.post(`${baseURL}/admin/login`, loginData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          maxRedirects: 0,
          validateStatus: function (status) {
            return status < 400; // Accept all 2xx and 3xx responses
          }
        });
        
        console.log(`  → Login response status: ${loginResponse.status}`);
        
        if (loginResponse.status === 302) {
          const redirectLocation = loginResponse.headers.location;
          console.log(`  → Redirect to: ${redirectLocation}`);
          
          if (redirectLocation && redirectLocation.includes('/admin/dashboard')) {
            console.log('  ✅ SUCCESS: Login redirected to dashboard');
            
            // Step 3: Follow redirect to dashboard 
            console.log('  → Accessing dashboard...');
            const dashboardResponse = await client.get(`${baseURL}/admin/dashboard`);
            console.log(`  → Dashboard status: ${dashboardResponse.status}`);
            
            if (dashboardResponse.status === 200) {
              // Check if dashboard contains expected content
              const dashboardContent = dashboardResponse.data;
              const hasTitle = dashboardContent.includes('डैशबोर्ड') || dashboardContent.includes('Dashboard');
              const hasUserInfo = dashboardContent.includes(testUser.mobile);
              
              console.log(`  → Dashboard content check: Title=${hasTitle}, UserInfo=${hasUserInfo}`);
              console.log('  ✅ SUCCESS: Dashboard loaded successfully');
              
              // Step 4: Test accessing other admin pages
              console.log('  → Testing other admin pages...');
              
              const pages = [
                { name: 'Mothers', url: '/admin/mothers' },
                { name: 'Plants', url: '/admin/plants' },
                { name: 'Photos', url: '/admin/photos' }
              ];
              
              for (const page of pages) {
                try {
                  const pageResponse = await client.get(`${baseURL}${page.url}`);
                  console.log(`    → ${page.name}: ${pageResponse.status === 200 ? '✅' : '❌'} (${pageResponse.status})`);
                } catch (pageError) {
                  console.log(`    → ${page.name}: ❌ Error`);
                }
              }
              
            } else {
              console.log('  ❌ FAIL: Dashboard not accessible');
            }
            
          } else if (redirectLocation && redirectLocation.includes('/admin/login')) {
            console.log('  ❌ FAIL: Redirected back to login page');
          } else {
            console.log(`  ❓ UNKNOWN: Unexpected redirect to ${redirectLocation}`);
          }
          
        } else {
          console.log('  ❌ FAIL: No redirect response from login');
        }
        
        // Step 5: Test logout
        console.log('  → Testing logout...');
        const logoutResponse = await client.get(`${baseURL}/admin/logout`);
        console.log(`  → Logout status: ${logoutResponse.status}`);
        
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
        if (error.response) {
          console.log(`    Status: ${error.response.status}`);
          console.log(`    Headers: ${JSON.stringify(error.response.headers)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
}

// Check if tough-cookie is available
try {
  require.resolve('tough-cookie');
  require.resolve('axios-cookiejar-support');
  testBrowserLikeLogin();
} catch (e) {
  console.log('📦 Installing required packages for browser-like testing...');
  console.log('   Run: npm install tough-cookie axios-cookiejar-support');
  console.log('   Then run this script again.');
}
