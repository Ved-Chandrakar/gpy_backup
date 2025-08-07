const axios = require('axios');

async function testAdminDashboard() {
  try {
    console.log('🔐 Testing admin login and dashboard...');
    
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
      withCredentials: true
    });

    // Login as admin
    const loginResponse = await axiosInstance.post('/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Admin login successful');
      
      // Test dashboard page
      const dashboardResponse = await axiosInstance.get('/admin/');
      console.log(`📊 Dashboard response: ${dashboardResponse.status}`);
      
      if (dashboardResponse.status === 200) {
        console.log('✅ Admin dashboard working correctly');
        console.log(`   Response size: ${dashboardResponse.data.length} bytes`);
        
        // Check if the response contains expected content
        const responseText = dashboardResponse.data;
        if (responseText.includes('Dashboard') || responseText.includes('dashboard')) {
          console.log('✅ Dashboard contains expected content');
        } else {
          console.log('⚠️  Dashboard may not contain expected content');
        }
      } else {
        console.log('❌ Dashboard request failed');
      }
      
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.log('❌ Error testing admin dashboard:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('🏁 Admin dashboard test completed');
}

testAdminDashboard();
