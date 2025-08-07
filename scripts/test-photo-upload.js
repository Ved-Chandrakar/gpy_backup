const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

const testPhotoUpload = async () => {
  try {
    console.log('🔍 Testing Mother Plant Photo Upload API...');
    
    // Step 1: Login as mother
    console.log('📞 Logging in as mother...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userId: 'M9876543210',
      password: 'mother123',
      loginType: 'mother'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Mother login successful');
    
    // Step 2: Get plant list to find assignment ID
    console.log('📋 Getting plant list to find assignment IDs...');
    const listResponse = await axios.get(`${BASE_URL}/mother/plants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!listResponse.data.success || !listResponse.data.data.plants.length) {
      throw new Error('No plant assignments found');
    }
    
    const assignmentId = listResponse.data.data.plants[0].assignment_id;
    console.log(`✅ Found assignment ID: ${assignmentId}`);
    
    // Step 3: Create a test image file
    const testImagePath = path.join(__dirname, 'test-plant-image.jpg');
    
    // Create a small test image file if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      // Create a simple 1x1 pixel image data
      const imageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x03, 0x02, 0x02, 0x02, 0x02, 0x02, 0x03, 0x02, 0x02, 0x02, 0x03,
        0x03, 0x03, 0x03, 0x04, 0x06, 0x04, 0x04, 0x04, 0x04, 0x04, 0x08, 0x06,
        0x06, 0x05, 0x06, 0x09, 0x08, 0x0A, 0x0A, 0x09, 0x08, 0x09, 0x09, 0x0A,
        0x0C, 0x0F, 0x0C, 0x0A, 0x0B, 0x0E, 0x0B, 0x09, 0x09, 0x0D, 0x11, 0x0D,
        0x0E, 0x0F, 0x10, 0x10, 0x11, 0x10, 0x0A, 0x0C, 0x12, 0x13, 0x12, 0x10,
        0x13, 0x0F, 0x10, 0x10, 0x10, 0xFF, 0xC9, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xCC, 0x00, 0x06, 0x00, 0x10,
        0x10, 0x05, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
        0xD2, 0xCF, 0x20, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, imageBuffer);
    }
    
    // Step 4: Upload photo
    console.log('📸 Uploading plant photo...');
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testImagePath));
    formData.append('latitude', '21.2514');
    formData.append('longitude', '81.6296');
    formData.append('remarks', 'Test plant photo upload after fixing the API');
    
    const uploadResponse = await axios.post(
      `${BASE_URL}/mother/plants/${assignmentId}/upload-photo`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (uploadResponse.data.success) {
      console.log('✅ Photo upload successful!');
      console.log('📊 Upload response:', JSON.stringify(uploadResponse.data, null, 2));
    } else {
      console.log('❌ Photo upload failed:', uploadResponse.data.message);
    }
    
    // Step 5: Test detail API again to see the uploaded photo
    console.log('🔍 Testing detail API to see uploaded photo...');
    const detailResponse = await axios.get(`${BASE_URL}/mother/plants/${assignmentId}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (detailResponse.data.success) {
      console.log('✅ Detail API after photo upload successful!');
      const completedSchedules = detailResponse.data.data.tracking_history.filter(h => h.upload_status === 'completed');
      console.log(`📈 Completed schedules: ${completedSchedules.length}`);
      console.log(`📊 Completion percentage: ${detailResponse.data.data.stats.completion_percentage}%`);
    } else {
      console.log('❌ Detail API failed:', detailResponse.data.message);
    }
    
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
};

testPhotoUpload();
