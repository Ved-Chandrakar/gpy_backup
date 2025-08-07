const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAdminLoginForm() {
  console.log('🔐 Testing Admin Login Form Submission...');
  
  try {
    // Create an axios instance to handle cookies
    const agent = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    // First, get the login page to get any session cookies
    console.log('\n1. Getting login page to establish session...');
    const loginPageResponse = await agent.get('/admin/login');
    console.log(`   ✅ Login page loaded (Status: ${loginPageResponse.status})`);
    
    // Extract cookies from the response
    const cookies = loginPageResponse.headers['set-cookie'];
    console.log(`   Cookies received: ${cookies ? cookies.length : 0}`);

    // Prepare form data
    const formData = qs.stringify({
      mobile: 'CGSTATE001',
      password: 'gpy@2025'
    });

    console.log('\n2. Submitting login form...');
    console.log(`   Username: CGSTATE001`);
    console.log(`   Password: gpy@2025`);

    // Submit the form with proper headers
    const loginResponse = await agent.post('/admin/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });

    console.log(`   ✅ Form submitted (Status: ${loginResponse.status})`);
    
    // Check response
    if (loginResponse.status === 302) {
      const location = loginResponse.headers.location;
      console.log(`   📍 Redirected to: ${location}`);
      
      if (location === '/admin/dashboard') {
        console.log('   🎉 LOGIN SUCCESSFUL! Redirected to dashboard');
        
        // Try to access the dashboard with the new cookies
        const dashboardCookies = loginResponse.headers['set-cookie'];
        if (dashboardCookies) {
          console.log('\n3. Testing dashboard access...');
          try {
            const dashboardResponse = await agent.get('/admin/dashboard', {
              headers: {
                'Cookie': dashboardCookies.join('; ')
              }
            });
            console.log(`   ✅ Dashboard accessible (Status: ${dashboardResponse.status})`);
          } catch (dashError) {
            console.log(`   ❌ Dashboard access failed: ${dashError.message}`);
          }
        }
        
      } else if (location === '/admin/login') {
        console.log('   ❌ LOGIN FAILED - Redirected back to login');
        console.log('   This usually means invalid credentials or role permissions');
      } else {
        console.log(`   ⚠️  Unexpected redirect: ${location}`);
      }
    } else {
      console.log(`   ⚠️  Unexpected response status: ${loginResponse.status}`);
    }

  } catch (error) {
    console.log('❌ Test failed:');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
  }
  
  console.log('\n=== Form Submission Test Complete ===');
}

testAdminLoginForm();
