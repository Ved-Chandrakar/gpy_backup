const axios = require('axios');

async function testDifferentPasswords() {
  try {
    console.log('🔐 Testing different password combinations...\n');

    const userIds = ['H003', 'H001', 'M9876543210'];
    const passwords = ['password123', 'hospital123', 'mother123', 'test123', '123456', 'admin123'];
    
    for (const userId of userIds) {
      console.log(`\n👤 Testing user: ${userId}`);
      
      for (const password of passwords) {
        try {
          const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: userId,
            password: password,
            loginType: 'api'
          });
          
          if (response.status === 200) {
            console.log(`✅ SUCCESS! ${userId} with password: ${password}`);
            console.log(`👤 User: ${response.data.data.user.name}`);
            console.log(`🏷️  Role: ${response.data.data.user.role}`);
            
            // If it's a hospital user, test mothers API
            if (userId.startsWith('H')) {
              try {
                const mothersResponse = await axios.get('http://localhost:3000/api/v1/mothers', {
                  headers: { Authorization: `Bearer ${response.data.data.token}` }
                });
                console.log(`📊 Mothers API works: ${mothersResponse.status}`);
              } catch (e) {
                console.log(`❌ Mothers API failed: ${e.response?.status}`);
              }
            }
            
            // If it's a mother user, test tracking API
            if (userId.startsWith('M')) {
              try {
                const trackingResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
                  headers: { Authorization: `Bearer ${response.data.data.token}` }
                });
                console.log(`🌱 Tracking API works: ${trackingResponse.status}`);
                console.log(`📊 Response:`, JSON.stringify(trackingResponse.data, null, 2));
              } catch (e) {
                console.log(`❌ Tracking API failed: ${e.response?.status} - ${e.response?.data?.message}`);
              }
            }
            
            return; // Stop on first success
          }
        } catch (error) {
          // Continue silently on error
        }
      }
      console.log(`❌ No valid password found for ${userId}`);
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
  
  console.log('\n🏁 Password test completed');
}

testDifferentPasswords();
