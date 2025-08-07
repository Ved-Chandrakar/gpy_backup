const axios = require('axios');

async function findWorkingMotherCredentials() {
  try {
    console.log('🔍 Finding working mother credentials...\n');

    const motherUserIds = ['M9876543210', 'M9832876546', 'M8888888888', '7777777777', '9832876541'];
    const passwords = ['password123', 'mother123', 'test123', '123456'];
    
    for (const userId of motherUserIds) {
      console.log(`👩 Testing mother: ${userId}`);
      
      for (const password of passwords) {
        try {
          const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: userId,
            password: password,
            loginType: 'api'
          });
          
          if (response.status === 200) {
            console.log(`✅ SUCCESS! UserId: ${userId}, Password: ${password}`);
            console.log(`👤 Name: ${response.data.data.user.name}`);
            console.log(`📱 Mobile: ${response.data.data.user.mobile}`);
            return { userId, password, userData: response.data.data };
          }
        } catch (error) {
          // Continue silently
        }
      }
      console.log(`❌ No valid password found for ${userId}`);
    }
    
    console.log('\n❌ No working mother credentials found');
    return null;

  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

findWorkingMotherCredentials();
