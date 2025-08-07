/**
 * Test Photo URLs in API Responses
 */

require('dotenv').config();
const axios = require('axios');

const testPhotoUrls = async () => {
  console.log('🧪 Testing Photo URLs in API Responses...\n');

  const baseURL = 'http://localhost:3000';

  try {
    // Step 1: Login as mother
    console.log('1️⃣ Logging in as mother...');
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      userId: '9832876541',
      password: '9832876541',
      loginType: 'mother'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Get plant details and check photo URLs
    console.log('\n2️⃣ Getting plant details to check photo URLs...');
    const detailsResponse = await axios.get(`${baseURL}/api/v1/mother/plants/3/details`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!detailsResponse.data.success) {
      throw new Error('Plant details failed: ' + detailsResponse.data.message);
    }

    console.log('✅ Plant details API successful');
    const data = detailsResponse.data.data;

    // Check photo URLs in month-wise tracking
    console.log('\n3️⃣ Checking Photo URLs:');
    
    let photoCount = 0;
    if (data.tracking_history_monthwise) {
      // Check Month 1 photos
      data.tracking_history_monthwise.month1.weeks.forEach((week, index) => {
        if (week.photo) {
          photoCount++;
          console.log(`\n📷 Photo ${photoCount} (Week ${index + 1}):`);
          console.log(`   Photo ID: ${week.photo.id}`);
          console.log(`   Photo URL: ${week.photo.photo_url}`);
          console.log(`   Is Full URL: ${week.photo.photo_url.startsWith('http') ? '✅ YES' : '❌ NO'}`);
          console.log(`   Upload Date: ${week.photo.upload_date}`);
          console.log(`   Location: ${week.photo.latitude}, ${week.photo.longitude}`);
        }
      });
    }

    // Step 3: Upload a new photo to test URL generation
    console.log('\n4️⃣ Uploading a test photo to check URL...');
    
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');
    
    // Create test image
    const testPhotoPath = path.join(__dirname, 'temp-url-test-photo.jpg');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0x36, 0x90, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testPhotoPath, testImageBuffer);

    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testPhotoPath));
    formData.append('latitude', '21.2514');
    formData.append('longitude', '81.6296');
    formData.append('remarks', 'URL test photo upload');

    const uploadResponse = await axios.post(
      `${baseURL}/api/v1/mother/plants/4/upload-photo`, // Try different assignment
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (uploadResponse.data.success) {
      const newPhoto = uploadResponse.data.data.photo;
      console.log('✅ Photo upload successful!');
      console.log(`\n📷 New Photo:`);
      console.log(`   Photo ID: ${newPhoto.id}`);
      console.log(`   Photo URL: ${newPhoto.photo_url}`);
      console.log(`   Is Full URL: ${newPhoto.photo_url.startsWith('http') ? '✅ YES' : '❌ NO'}`);
      
      // Test if URL is accessible
      try {
        const photoCheckResponse = await axios.head(newPhoto.photo_url);
        console.log(`   URL Accessible: ✅ YES (Status: ${photoCheckResponse.status})`);
      } catch (error) {
        console.log(`   URL Accessible: ❌ NO (Error: ${error.message})`);
      }
    } else {
      console.log('❌ Photo upload failed:', uploadResponse.data.message);
    }

    // Cleanup
    if (fs.existsSync(testPhotoPath)) {
      fs.unlinkSync(testPhotoPath);
    }

    console.log('\n🎉 Photo URL test completed!');
    console.log(`\nTotal photos checked: ${photoCount}`);

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testPhotoUrls();
