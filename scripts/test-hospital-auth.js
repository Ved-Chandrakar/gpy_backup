const axios = require('axios');

async function testHospitalLoginAndDataCheck() {
  try {
    console.log('🏥 Testing hospital login and data availability...\n');

    // Check if hospital user exists
    console.log('1. Attempting hospital login...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
        username: 'hospital1',
        password: 'hospital123'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Hospital login successful');
        const token = loginResponse.data.data.token;
        
        // Check available mothers
        const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`📊 Mothers API response:`, mothersResponse.data);
        
        // Try to check what users exist
        console.log('\n2. Checking system users...');
        try {
          const usersResponse = await axios.get('http://localhost:3000/admin/login');
          console.log('✅ Admin login page accessible');
        } catch (error) {
          console.log('❌ Admin page error:', error.response?.status);
        }
        
      } else {
        console.log('❌ Hospital login failed');
      }
    } catch (loginError) {
      console.log('❌ Hospital login error:', loginError.response?.data || loginError.message);
      
      // Try alternative login credentials
      console.log('\n🔄 Trying alternative credentials...');
      try {
        const altLoginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
          username: 'admin',
          password: 'admin123'
        });
        console.log('✅ Admin login successful');
        const adminToken = altLoginResponse.data.data.token;
        
        // Check mothers with admin token
        const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`📊 Mothers (admin):`, mothersResponse.data);
        
      } catch (altError) {
        console.log('❌ Admin login also failed:', altError.response?.data || altError.message);
      }
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
  
  console.log('\n🏁 Test completed');
}

testHospitalLoginAndDataCheck();
