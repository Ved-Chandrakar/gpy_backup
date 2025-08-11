/**
 * Test Updated Mother Plants API - Enhanced Progress Tracking
 */

require('dotenv').config();
const axios = require('axios');

const testMotherPlantsAPI = async () => {
  try {
    console.log('🌱 Testing Updated Mother Plants API...\n');

    const baseURL = 'http://localhost:3000';
    
    // We'll need a mother user with plant assignments for testing
    // Let's first create a quick test scenario or use existing data
    
    // Step 1: Check if we have any mother users
    console.log('🔍 Step 1: Looking for existing mother users...');
    
    // Let's check what mother users we have
    const checkUsersResponse = await axios.get(`${baseURL}/api/v1/auth/login`, {
      data: {
        userId: 'test', // This will fail but might give us error info
        password: 'test',
        loginType: 'mother'
      }
    }).catch(err => {
      console.log('Expected error (checking endpoint):', err.response?.status);
    });

    // For now, let's create a mother login scenario
    // First, let's check what mothers exist in our database by trying a realistic mobile number
    const motherCredentials = [
      { userId: '9832876541', password: '9832876541' }, // Riya chandrakar has assignments
      { userId: '9876543210', password: '9876543210' }, // From our hospital registration tests
      { userId: '9876543211', password: '9876543211' },
      { userId: '9876543212', password: '9876543212' }
    ];

    let loggedInMother = null;
    let authToken = null;

    // Try to log in with existing mother accounts
    for (const cred of motherCredentials) {
      try {
        console.log(`🔐 Trying to login with mother: ${cred.userId}...`);
        
        const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
          userId: cred.userId,
          password: cred.password,
          loginType: 'mother'
        });

        if (loginResponse.data.success) {
          loggedInMother = cred.userId;
          authToken = loginResponse.data.data.token;
          console.log(`✅ Successfully logged in as mother: ${loggedInMother}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Login failed for ${cred.userId}:`, error.response?.data?.message || error.message);
      }
    }

    if (!authToken) {
      console.log('❌ No mother accounts found to test with.');
      console.log('💡 Please run the hospital registration test first to create mother accounts.');
      return;
    }

    // Step 2: Test the updated plants API
    console.log(`\n🌱 Step 2: Testing plants API for mother: ${loggedInMother}...`);
    
    try {
      const plantsResponse = await axios.get(`${baseURL}/api/v1/mother/plants`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (plantsResponse.data.success) {
        console.log('✅ Mother plants API successful!');
        console.log('\n📊 API Response Structure:');
        console.log('='.repeat(50));
        
        const data = plantsResponse.data.data;
        
        // Display mother info
        console.log(`\n👩 Mother Information:`);
        console.log(`   Name: ${data.mother_name}`);
        
        // Display plant summary
        console.log(`\n🌿 Plant Summary:`);
        console.log(`   Total Plants Assigned: ${data.plant_summary.total_plants_assigned}`);
        
        // Display overall summary
        console.log(`\n📈 Overall Progress Summary:`);
        console.log(`   Total Photos Required: ${data.overall_summary.total_photos_required}`);
        console.log(`   Photos Uploaded: ${data.overall_summary.total_photos_uploaded}`);
        console.log(`   Photos Pending: ${data.overall_summary.total_photos_pending}`);
        console.log(`   Photos Overdue: ${data.overall_summary.total_photos_overdue}`);
        console.log(`   Overall Completion: ${data.overall_summary.overall_completion_percentage}%`);
        
        // Display each plant's detailed progress
        if (data.plant_summary.plants && data.plant_summary.plants.length > 0) {
          console.log(`\n🌱 Individual Plant Progress:`);
          console.log('='.repeat(50));
          
          data.plant_summary.plants.forEach((plant, index) => {
            console.log(`\n🌿 Plant ${index + 1}: ${plant.plant.name} (${plant.plant.local_name})`);
            console.log(`   Assignment ID: ${plant.assignment_id}`);
            console.log(`   Assigned Date: ${plant.assigned_date}`);
            console.log(`   Species: ${plant.plant.species}`);
            
            console.log(`\n   📊 Overall Progress:`);
            console.log(`     Total Required: ${plant.overall_progress.total_photos_required} photos`);
            console.log(`     Uploaded: ${plant.overall_progress.photos_uploaded}`);
            console.log(`     Pending: ${plant.overall_progress.photos_pending}`);
            console.log(`     Overdue: ${plant.overall_progress.photos_overdue}`);
            console.log(`     Completion: ${plant.overall_progress.completion_percentage}%`);
            
            console.log(`\n   📅 Month-wise Progress:`);
            console.log(`     Month 1 (Weekly): ${plant.detailed_progress.month1_progress.uploaded}/${plant.detailed_progress.month1_progress.total_required} uploaded, ${plant.detailed_progress.month1_progress.pending} pending, ${plant.detailed_progress.month1_progress.overdue} overdue`);
            console.log(`     Month 2 (Bi-weekly): ${plant.detailed_progress.month2_progress.uploaded}/${plant.detailed_progress.month2_progress.total_required} uploaded, ${plant.detailed_progress.month2_progress.pending} pending, ${plant.detailed_progress.month2_progress.overdue} overdue`);
            console.log(`     Month 3 (Bi-weekly): ${plant.detailed_progress.month3_progress.uploaded}/${plant.detailed_progress.month3_progress.total_required} uploaded, ${plant.detailed_progress.month3_progress.pending} pending, ${plant.detailed_progress.month3_progress.overdue} overdue`);
            
            if (plant.next_upload) {
              console.log(`\n   ⏰ Next Upload Due:`);
              console.log(`     Date: ${plant.next_upload.due_date}`);
              console.log(`     Week: ${plant.next_upload.week_number}, Month: ${plant.next_upload.month_number}`);
              console.log(`     Days Remaining: ${plant.next_upload.days_remaining}`);
              console.log(`     Status: ${plant.next_upload.is_overdue ? '🚨 OVERDUE' : '⏳ On Track'}`);
            } else {
              console.log(`\n   ✅ All uploads completed for this plant!`);
            }
            
            console.log(`\n   📋 Schedule Information:`);
            console.log(`     ${plant.schedule_info.month1}`);
            console.log(`     ${plant.schedule_info.month2}`);
            console.log(`     ${plant.schedule_info.month3}`);
            console.log(`     Duration: ${plant.schedule_info.total_duration}`);
          });
        } else {
          console.log('\n📝 No plants assigned to this mother yet.');
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ API Test Completed Successfully!');
        
      } else {
        console.log('❌ Plants API failed:', plantsResponse.data.message);
      }

    } catch (error) {
      console.log('❌ Plants API error:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || error.response.statusText);
        if (error.response.data) {
          console.log('   Full Response:', JSON.stringify(error.response.data, null, 2));
        }
      } else {
        console.log('   Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testMotherPlantsAPI().then(() => {
  console.log('\n🎉 Mother Plants API test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
