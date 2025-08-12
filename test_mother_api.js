const axios = require('axios');

async function testMotherAPI() {
  try {
    console.log('=== Testing Mother Photos API ===');
    
    // 1. Login with mother user
    console.log('1. Logging in with mother user...');
    
    // Try different possible passwords
    const passwords = ['123456', 'password', 'password123', '9898656532', 'demo123'];
    let loginResponse = null;
    let token = null;
    
    for (const password of passwords) {
      try {
        console.log(`Trying password: ${password}`);
        loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
          userId: '9898656532',
          password: password,
          loginType: 'mother'
        });
        
        if (loginResponse.data.success) {
          console.log('Login successful with password:', password);
          token = loginResponse.data.data.token;
          break;
        }
      } catch (error) {
        // Try next password
        continue;
      }
    }
    
    if (!token) {
      console.error('All login attempts failed');
      return;
    }
    
    // 2. Get mother photos
    console.log('2. Getting mother photos...');
    const photosResponse = await axios.get('http://localhost:3000/api/v1/mother/photos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Photos API Response:', photosResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 500) {
      console.error('Server error - check terminal output for details');
    }
  }
}

testMotherAPI();
