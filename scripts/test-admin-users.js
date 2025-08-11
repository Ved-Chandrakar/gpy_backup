const axios = require('axios');

const testAdminUsers = async () => {
  try {
    console.log('🔐 Testing admin login and users page...');
    
    // First login as admin
    const loginResponse = await axios.post('http://localhost:3000/admin/login', {
      mobile: 'state',
      password: 'state'
    });
    
    console.log('✅ Admin login successful');
    
    // Extract session cookie
    const cookies = loginResponse.headers['set-cookie'];
    let sessionCookie = '';
    if (cookies) {
      sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'));
    }
    
    // Test users page
    const usersResponse = await axios.get('http://localhost:3000/admin/users', {
      headers: {
        'Cookie': sessionCookie || ''
      },
      validateStatus: () => true // Don't throw on non-2xx status
    });
    
    console.log(`📋 Users page response: ${usersResponse.status}`);
    
    if (usersResponse.status === 200) {
      console.log('✅ Admin users page working correctly');
      console.log(`   Response size: ${usersResponse.data.length} bytes`);
      
      // Check if it contains user data
      if (usersResponse.data.includes('users') || usersResponse.data.includes('उपयोगकर्ता')) {
        console.log('✅ Page contains user data');
      }
    } else if (usersResponse.status === 500) {
      console.error('❌ Server error on users page');
      // Check if response contains error details
      if (usersResponse.data.includes('District is not associated')) {
        console.log('🔍 Still has association error - checking admin controller...');
      }
    } else if (usersResponse.status === 302) {
      console.log('↪️ Redirected - likely authentication issue');
    } else {
      console.log(`⚠️ Unexpected status: ${usersResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Headers:`, error.response.headers);
    }
  }
};

testAdminUsers().then(() => {
  console.log('\n🏁 Admin test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
