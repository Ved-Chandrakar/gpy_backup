/**
 * Quick Plant Photo Upload Test
 * Tests the mother plant photo upload API with minimal setup
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const quickTest = async () => {
  console.log('🚀 Quick Plant Photo Upload Test...\n');

  const baseURL = 'http://localhost:3000';
  const testPhotoPath = path.join(__dirname, 'temp-test-photo.jpg');

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

    // Step 2: Get plant assignments
    console.log('\n2️⃣ Getting plant assignments...');
    const plantsResponse = await axios.get(`${baseURL}/api/v1/mother/plants`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const plants = plantsResponse.data.data?.plant_summary?.plants || [];
    if (plants.length === 0) {
      throw new Error('No plant assignments found');
    }

    const assignment = plants[0];
    console.log(`✅ Found ${plants.length} plants. Using: ${assignment.plant.name} (ID: ${assignment.assignment_id})`);

    // Step 3: Create test image
    console.log('\n3️⃣ Creating test image...');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0x36, 0x90, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testPhotoPath, testImageBuffer);
    console.log('✅ Test image created');

    // Step 4: Upload photo
    console.log('\n4️⃣ Uploading plant photo...');
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testPhotoPath));
    formData.append('latitude', '21.2514');
    formData.append('longitude', '81.6296');
    formData.append('remarks', 'Quick test upload - plant looking healthy!');

    const uploadResponse = await axios.post(
      `${baseURL}/api/v1/mother/plants/${assignment.assignment_id}/upload-photo`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (uploadResponse.data.success) {
      const photo = uploadResponse.data.data.photo;
      const stats = uploadResponse.data.data.tracking_stats;
      
      console.log('✅ Photo uploaded successfully!');
      console.log(`📷 Photo ID: ${photo.id}`);
      console.log(`📍 Location: ${photo.latitude}, ${photo.longitude}`);
      console.log(`📈 Progress: ${stats.completed}/${stats.total_schedules} photos completed`);
      console.log(`🎯 Completion: ${((stats.completed / stats.total_schedules) * 100).toFixed(1)}%`);
    } else {
      throw new Error('Upload failed: ' + uploadResponse.data.message);
    }

    // Cleanup
    if (fs.existsSync(testPhotoPath)) {
      fs.unlinkSync(testPhotoPath);
    }

    console.log('\n🎉 Plant photo upload API is working perfectly!');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    // Cleanup on error
    if (fs.existsSync(testPhotoPath)) {
      fs.unlinkSync(testPhotoPath);
    }
  }
};

quickTest();
