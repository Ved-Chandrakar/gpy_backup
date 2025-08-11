/**
 * Test Mother Plant Photo Upload API
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const testMotherPlantPhotoUpload = async () => {
  try {
    console.log('🧪 Testing Mother Plant Photo Upload API...\n');

    const baseURL = 'http://localhost:3000';
    
    // Test data
    const testData = {
      // Using actual mother from our test data
      motherMobile: '9832876541', // Riya chandrakar has plant assignments
      password: '9832876541',
      assignmentId: 3, // Assignment ID from our test data
      testPhotoPath: path.join(__dirname, 'test-plant-photo.jpg')
    };

    // Step 1: Login as mother to get token
    console.log('🔐 Step 1: Logging in as mother...');
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
        userId: testData.motherMobile,
        password: testData.password,
        loginType: 'mother'
      });

      if (!loginResponse.data.success) {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }

      const authToken = loginResponse.data.data.token;
      console.log('✅ Login successful, token received');

      // Step 2: Get mother's plant assignments
      console.log('\n📋 Step 2: Getting plant assignments...');
      
      const plantsResponse = await axios.get(`${baseURL}/api/v1/mother/plants`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!plantsResponse.data.success) {
        console.log('❌ Failed to get plants:', plantsResponse.data.message);
        return;
      }

      const plants = plantsResponse.data.data?.plant_summary?.plants || [];
      console.log(`✅ Found ${plants.length} plant assignments`);
      
      if (plants.length === 0) {
        console.log('⚠️ No plant assignments found for this mother');
        console.log('Response data:', JSON.stringify(plantsResponse.data, null, 2));
        console.log('💡 Please assign plants to this mother first using hospital account');
        return;
      }

      // Use the first plant assignment
      const assignmentId = plants[0].assignment_id;
      console.log(`📱 Using assignment ID: ${assignmentId} (${plants[0].plant.name})`);

      // Step 3: Create a test image if it doesn't exist
      if (!fs.existsSync(testData.testPhotoPath)) {
        console.log('\n🖼️ Creating test image...');
        
        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
          0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x17, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x5C, 0x36, 0x90, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x49,
          0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        fs.writeFileSync(testData.testPhotoPath, testImageBuffer);
        console.log('✅ Test image created');
      }

      // Step 4: Upload plant photo
      console.log('\n📤 Step 3: Uploading plant photo...');

      const formData = new FormData();
      formData.append('photo', fs.createReadStream(testData.testPhotoPath));
      formData.append('latitude', '21.2514'); // Raipur coordinates
      formData.append('longitude', '81.6296');
      formData.append('remarks', 'Test photo upload from API test script');

      const uploadResponse = await axios.post(
        `${baseURL}/api/v1/mother/plants/${assignmentId}/upload-photo`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (uploadResponse.data.success) {
        console.log('✅ Photo uploaded successfully!');
        console.log('\n📊 Upload Response:');
        console.log(`   Photo ID: ${uploadResponse.data.data.photo.id}`);
        console.log(`   Photo URL: ${uploadResponse.data.data.photo.photo_url}`);
        console.log(`   Upload Date: ${uploadResponse.data.data.photo.upload_date}`);
        console.log(`   Location: ${uploadResponse.data.data.photo.latitude}, ${uploadResponse.data.data.photo.longitude}`);
        console.log(`   Remarks: ${uploadResponse.data.data.photo.remarks}`);

        if (uploadResponse.data.data.updated_schedule) {
          console.log('\n📅 Schedule Updated:');
          console.log(`   Schedule ID: ${uploadResponse.data.data.updated_schedule.schedule_id}`);
          console.log(`   Week Number: ${uploadResponse.data.data.updated_schedule.week_number}`);
          console.log(`   Status: ${uploadResponse.data.data.updated_schedule.status}`);
        }

        if (uploadResponse.data.data.tracking_stats) {
          const stats = uploadResponse.data.data.tracking_stats;
          console.log('\n📈 Tracking Stats:');
          console.log(`   Total Schedules: ${stats.total_schedules}`);
          console.log(`   Completed: ${stats.completed}`);
          console.log(`   Pending: ${stats.pending}`);
          console.log(`   Overdue: ${stats.overdue}`);
          console.log(`   Next Due Date: ${stats.next_due_date || 'N/A'}`);
        }
      } else {
        console.log('❌ Photo upload failed:', uploadResponse.data.message);
      }

    } catch (authError) {
      if (authError.response) {
        console.log('❌ Authentication error:', authError.response.data.message);
        console.log('💡 Make sure you have a mother user with the mobile number:', testData.motherMobile);
        console.log('💡 Or create a mother user and assign plants to test this API');
      } else {
        console.log('❌ Network error:', authError.message);
      }
    }

    // Cleanup test image
    if (fs.existsSync(testData.testPhotoPath)) {
      fs.unlinkSync(testData.testPhotoPath);
      console.log('\n🧹 Cleaned up test image');
    }

    console.log('\n🎉 API test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Helper function to create a mother and plant assignment for testing
const createTestMotherAndAssignment = async () => {
  console.log('🔧 Creating test mother and plant assignment...\n');
  
  // This would require hospital login and creating child + plant assignment
  // For now, just show the steps needed
  console.log('📝 To test the photo upload API, you need:');
  console.log('1. A mother user (child record with mother_mobile)');
  console.log('2. A plant assignment for that mother');
  console.log('3. Generated tracking schedule for the assignment');
  console.log('\n💡 You can use the existing seeded hospital users to create these records');
  console.log('💡 Or modify the testData.motherMobile in this script to use an existing mother');
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--setup')) {
  createTestMotherAndAssignment();
} else {
  testMotherPlantPhotoUpload();
}

console.log('\n📖 Usage:');
console.log('  node scripts/test-mother-photo-upload.js          # Run the test');
console.log('  node scripts/test-mother-photo-upload.js --setup  # Show setup instructions');
