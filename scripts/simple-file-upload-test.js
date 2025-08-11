/**
 * Simple File Upload Test for Hospital Mother Registration
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const simpleFileUploadTest = async () => {
  try {
    console.log('🧪 Simple File Upload Test...\n');

    const baseURL = 'http://localhost:3000';
    
    // Step 1: Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      userid: 'CG-CHC-3322-001',
      password: 'gpy@2025'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Test without files first
    console.log('\n📝 Testing registration without files...');
    
    const formData = new FormData();
    formData.append('mother_name', 'Test Mother');
    formData.append('father_husband_name', 'Test Father');
    formData.append('mobile_number', '9876543999');
    formData.append('delivery_date', '2024-12-15');
    formData.append('delivery_type', 'normal');
    formData.append('blood_group', 'O+');
    formData.append('district_lgd_code', '375');
    formData.append('block_lgd_code', '3604');
    formData.append('child_gender', 'female');
    formData.append('plants', '[9, 10]');

    try {
      const response = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          },
          timeout: 10000
        }
      );

      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log('❌ Registration failed');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Step 3: Test with a simple file
    console.log('\n📤 Testing with file upload...');
    
    // Create a simple test image
    const testImagePath = path.join(__dirname, 'simple-test.png');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x17, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0x36, 0x90, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, testImageBuffer);

    const fileFormData = new FormData();
    fileFormData.append('mother_name', 'Test Mother With Photo');
    fileFormData.append('father_husband_name', 'Test Father');
    fileFormData.append('mobile_number', '9876543998');
    fileFormData.append('delivery_date', '2024-12-15');
    fileFormData.append('delivery_type', 'normal');
    fileFormData.append('blood_group', 'O+');
    fileFormData.append('district_lgd_code', '375');
    fileFormData.append('block_lgd_code', '3604');
    fileFormData.append('child_gender', 'female');
    fileFormData.append('plants', '[9, 10]');
    fileFormData.append('photo', fs.createReadStream(testImagePath));

    try {
      const fileResponse = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        fileFormData,
        {
          headers: {
            ...fileFormData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          },
          timeout: 10000
        }
      );

      console.log('✅ File upload successful!');
      console.log('Response:', JSON.stringify(fileResponse.data, null, 2));

    } catch (error) {
      console.log('❌ File upload failed');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

simpleFileUploadTest();
