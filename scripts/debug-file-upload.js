/**
 * Debug File Upload - Simplified test to see exact error
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const debugFileUpload = async () => {
  try {
    console.log('🔍 Debug File Upload Test...\n');

    const baseURL = 'http://localhost:3000';
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...');
    
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      userId: 'CG-CHC-3322-001',
      password: 'gpy@2025',
      loginType: 'hospital'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Create a simple test image
    console.log('\n🖼️ Step 2: Creating test image...');
    const testImagePath = path.join(__dirname, 'debug-test-image.jpg');
    
    // Create a minimal JPEG file
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Test image created');

    // Step 3: Test simple registration (no files)
    console.log('\n📝 Step 3: Testing registration without files...');
    
    try {
      const formData = new FormData();
      formData.append('mother_name', 'Debug Test Mother');
      formData.append('father_husband_name', 'Debug Test Father');
      formData.append('mobile_number', '9876543210');
      formData.append('delivery_date', '2024-12-15');
      formData.append('delivery_type', 'normal');
      formData.append('blood_group', 'O+');
      formData.append('district_lgd_code', '387');
      formData.append('block_lgd_code', '3707');
      formData.append('child_gender', 'female');
      formData.append('plants', '[9, 10]');

      const response = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 30000
        }
      );

      console.log('✅ Registration without files successful:', {
        success: response.data.success,
        message: response.data.message,
        child_id: response.data.data?.child_id
      });

    } catch (error) {
      console.log('❌ Registration without files failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('   Error:', error.message);
      }
    }

    // Step 4: Test with single file
    console.log('\n📷 Step 4: Testing registration with single file...');
    
    try {
      const formData = new FormData();
      formData.append('mother_name', 'Debug Test Mother 2');
      formData.append('father_husband_name', 'Debug Test Father 2');
      formData.append('mobile_number', '9876543211');
      formData.append('delivery_date', '2024-12-15');
      formData.append('delivery_type', 'normal');
      formData.append('blood_group', 'O+');
      formData.append('district_lgd_code', '387');
      formData.append('block_lgd_code', '3707');
      formData.append('child_gender', 'female');
      formData.append('plants', '[9, 10]');
      formData.append('mother_photo', fs.createReadStream(testImagePath), {
        filename: 'test-mother-photo.jpg',
        contentType: 'image/jpeg'
      });

      const response = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 30000
        }
      );

      console.log('✅ Registration with file successful:', {
        success: response.data.success,
        message: response.data.message,
        child_id: response.data.data?.child_id,
        files_uploaded: response.data.data?.files_uploaded
      });

    } catch (error) {
      console.log('❌ Registration with file failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        console.log('   Headers:', error.response.headers);
      } else {
        console.log('   Error:', error.message);
        console.log('   Code:', error.code);
      }
    }

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    console.log('\n🧹 Cleanup completed');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
};

debugFileUpload().then(() => {
  console.log('\n🎉 Debug test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
