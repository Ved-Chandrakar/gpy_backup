const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const loginData = {
  userId: '9876543210',
  password: '9876543210',
  loginType: 'mother'
};

async function testPhotoUrls() {
  try {
    console.log('=== Testing Photo URLs After Fix ===\n');

    // 1. Login as mother
    console.log('1. Logging in as mother...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.access_token;
    const userId = loginResponse.data.data.user.user_id;
    console.log('✅ Login successful, User ID:', userId);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Get mother plants (should include photo URLs)
    console.log('\n2. Testing mother/plants API...');
    const plantsResponse = await axios.get(`${BASE_URL}/mother/plants`, { headers });
    
    if (plantsResponse.data.success && plantsResponse.data.data.progress.month_wise) {
      console.log('✅ Mother plants API response received');
      
      // Check for photo URLs in month-wise data
      const monthWise = plantsResponse.data.data.progress.month_wise;
      let foundPhotoUrls = false;
      
      Object.keys(monthWise).forEach(month => {
        monthWise[month].weeks.forEach(week => {
          if (week.photos && week.photos.length > 0) {
            foundPhotoUrls = true;
            console.log(`\n📸 Found ${week.photos.length} photos in ${month} - ${week.week_title}:`);
            week.photos.forEach((photo, index) => {
              console.log(`   Photo ${index + 1}: ${photo.photo_url}`);
              console.log(`   Full URL: ${photo.full_url || 'NOT PROVIDED'}`);
              
              // Test if URL is accessible
              if (photo.photo_url && (photo.photo_url.startsWith('http://') || photo.photo_url.startsWith('https://'))) {
                console.log(`   ✅ Photo URL appears to be full URL`);
              } else {
                console.log(`   ❌ Photo URL is not a full URL: ${photo.photo_url}`);
              }
            });
          }
        });
      });
      
      if (!foundPhotoUrls) {
        console.log('ℹ️ No photos found in mother/plants response');
      }
    }

    // 3. Get plant details for specific plant
    console.log('\n3. Testing plant details API...');
    const plantDetailsResponse = await axios.get(`${BASE_URL}/mother/plant-details/1`, { headers });
    
    if (plantDetailsResponse.data.success) {
      console.log('✅ Plant details API response received');
      
      const trackingHistory = plantDetailsResponse.data.data.tracking_history;
      let foundPhotoUrls = false;
      
      Object.keys(trackingHistory).forEach(month => {
        trackingHistory[month].weeks.forEach(week => {
          if (week.photos && week.photos.length > 0) {
            foundPhotoUrls = true;
            console.log(`\n📸 Found ${week.photos.length} photos in plant details ${month} - ${week.week_title}:`);
            week.photos.forEach((photo, index) => {
              console.log(`   Photo ${index + 1}: ${photo.photo_url}`);
              
              // Test if URL is accessible
              if (photo.photo_url && (photo.photo_url.startsWith('http://') || photo.photo_url.startsWith('https://'))) {
                console.log(`   ✅ Photo URL appears to be full URL`);
              } else {
                console.log(`   ❌ Photo URL is not a full URL: ${photo.photo_url}`);
              }
            });
          }
        });
      });
      
      if (!foundPhotoUrls) {
        console.log('ℹ️ No photos found in plant details response');
      }
    }

    // 4. Test URL helper directly
    console.log('\n4. Testing URL helper directly...');
    const { getFullPhotoUrl, getFullFileUrl } = require('../utils/urlHelpers');
    
    const testPaths = [
      'test-photo.jpg',
      'plant-photos/test-photo.jpg',
      'uploads/plant-photos/test-photo.jpg',
      '/uploads/plant-photos/test-photo.jpg',
      'uploads\\plant-photos\\test-photo.jpg'
    ];
    
    console.log('URL Helper Test Results:');
    testPaths.forEach(path => {
      const result = getFullPhotoUrl(path);
      console.log(`   Input: "${path}"`);
      console.log(`   Output: "${result}"`);
      console.log('   ----');
    });

    // 5. Test a photo upload to see real URL format
    console.log('\n5. Testing photo upload to see actual URL format...');
    // This would require a real file upload, so we'll skip for now

    console.log('\n=== Photo URL Test Complete ===');

  } catch (error) {
    console.error('❌ Error during photo URL test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPhotoUrls();
