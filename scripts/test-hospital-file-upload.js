/**
 * Test Hospital New Mother Registration API with File Upload
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const testHospitalMotherRegistration = async () => {
  try {
    console.log('🧪 Testing Hospital New Mother Registration API with File Upload...\n');

    const baseURL = 'http://localhost:3000';
    
    // Test data
    const testData = {
      hospitalUserId: 'CG-CHC-3322-001', // Use one of our seeded hospital users
      password: 'gpy@2025',
      testImagePath: path.join(__dirname, 'test-mother-photo.jpg'),
      testDocumentPath: path.join(__dirname, 'test-delivery-document.pdf'),
      motherData: {
        mother_name: 'Test Mother Name',
        father_husband_name: 'Test Father Name',
        mobile_number: '9876543210',
        delivery_date: '2024-12-15',
        delivery_type: 'normal',
        blood_group: 'O+',
        district_lgd_code: '387', // RAIPUR district LGD code (hospital is in Raipur)
        block_lgd_code: '3707', // TILDA block LGD code (within Raipur district)
        child_gender: 'female',
        plants: '[9, 10]' // JSON string of valid plant IDs
      }
    };

    // Step 1: Login as hospital user
    console.log('🔐 Step 1: Logging in as hospital user...');
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
        userId: testData.hospitalUserId,
        password: testData.password,
        loginType: 'hospital'
      });

      if (!loginResponse.data.success) {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }

      const authToken = loginResponse.data.data.token;
      console.log('✅ Login successful');

      // Step 2: Create test files if they don't exist
      console.log('\n🖼️ Step 2: Preparing test files...');
      
      // Create test image (simple PNG)
      if (!fs.existsSync(testData.testImagePath)) {
        const testImageBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
          0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x17, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x5C, 0x36, 0x90, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x49,
          0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(testData.testImagePath, testImageBuffer);
        console.log('✅ Test image created');
      }

      // Create test PDF document
      if (!fs.existsSync(testData.testDocumentPath)) {
        const testPdfBuffer = Buffer.from([
          0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3,
          0xCF, 0xD3, 0x0A, 0x0A, 0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A,
          0x3C, 0x3C, 0x0A, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x20, 0x2F, 0x43, 0x61,
          0x74, 0x61, 0x6C, 0x6F, 0x67, 0x0A, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73,
          0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E,
          0x64, 0x6F, 0x62, 0x6A, 0x0A
        ]);
        fs.writeFileSync(testData.testDocumentPath, testPdfBuffer);
        console.log('✅ Test PDF document created');
      }

      // Step 3: Test mother registration with multiple files
      console.log('\n👩 Step 3: Testing mother registration with multiple files...');

      const formData = new FormData();
      
      // Add form fields
      Object.keys(testData.motherData).forEach(key => {
        formData.append(key, testData.motherData[key]);
      });
      
      // Add files
      formData.append('mother_photo', fs.createReadStream(testData.testImagePath));
      formData.append('delivery_document', fs.createReadStream(testData.testDocumentPath));

      const registrationResponse = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (registrationResponse.data.success) {
        console.log('✅ Mother registration with files successful!');
        console.log('\n📊 Registration Response:');
        console.log(`   Registration ID: ${registrationResponse.data.data.registration_id || 'N/A'}`);
        console.log(`   Child ID: ${registrationResponse.data.data.child_id || 'N/A'}`);
        console.log(`   Mother Name: ${registrationResponse.data.data.mother_name || 'N/A'}`);
        console.log(`   Mobile: ${registrationResponse.data.data.mobile_number || 'N/A'}`);
        console.log(`   Files Uploaded:`, registrationResponse.data.data.files_uploaded || 'N/A');
        console.log(`   Assigned Plants: ${registrationResponse.data.data.assigned_plants ? registrationResponse.data.data.assigned_plants.map(p => p.name).join(', ') : 'N/A'}`);
      } else {
        console.log('❌ Mother registration failed:', registrationResponse.data.message);
      }

      // Step 4: Test with single file upload (backward compatibility)
      console.log('\n📤 Step 4: Testing with single file upload...');

      const singleFileData = {
        ...testData.motherData,
        mobile_number: '9876543211' // Different mobile to avoid duplicate
      };

      const singleFormData = new FormData();
      
      // Add form fields
      Object.keys(singleFileData).forEach(key => {
        singleFormData.append(key, singleFileData[key]);
      });
      
      // Add single photo file
      singleFormData.append('photo', fs.createReadStream(testData.testImagePath));

      const singleFileResponse = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        singleFormData,
        {
          headers: {
            ...singleFormData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (singleFileResponse.data.success) {
        console.log('✅ Single file upload successful!');
        console.log(`   Child ID: ${singleFileResponse.data.data.child_id}`);
      } else {
        console.log('❌ Single file upload failed:', singleFileResponse.data.message);
      }

      // Step 5: Test without any files
      console.log('\n📝 Step 5: Testing without files...');

      const noFileData = {
        ...testData.motherData,
        mobile_number: '9876543212' // Different mobile to avoid duplicate
      };

      const noFileFormData = new FormData();
      
      // Add form fields only
      Object.keys(noFileData).forEach(key => {
        noFileFormData.append(key, noFileData[key]);
      });

      const noFileResponse = await axios.post(
        `${baseURL}/api/v1/hospital/new-mother-registration`,
        noFileFormData,
        {
          headers: {
            ...noFileFormData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (noFileResponse.data.success) {
        console.log('✅ Registration without files successful!');
        console.log(`   Child ID: ${noFileResponse.data.data.child_id}`);
      } else {
        console.log('❌ Registration without files failed:', noFileResponse.data.message);
      }

    } catch (authError) {
      if (authError.response) {
        console.log('❌ API error:', authError.response.status, authError.response.data.message || authError.response.statusText);
        if (authError.response.data) {
          console.log('   Full response:', JSON.stringify(authError.response.data, null, 2));
        }
      } else {
        console.log('❌ Network error:', authError.message);
      }
    }

    // Cleanup test files
    [testData.testImagePath, testData.testDocumentPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log('\n🧹 Cleaned up test files');

    console.log('\n🎉 File upload API test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testHospitalMotherRegistration();
