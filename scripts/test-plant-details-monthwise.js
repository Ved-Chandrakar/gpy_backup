/**
 * Test Plant Details API with Month-wise Tracking
 */

require('dotenv').config();
const axios = require('axios');

const testPlantDetails = async () => {
  console.log('🧪 Testing Plant Details API with Month-wise Tracking...\n');

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

    // Step 2: Get plant details with month-wise tracking
    console.log('\n2️⃣ Getting plant details...');
    const detailsResponse = await axios.get(`${baseURL}/api/v1/mother/plants/3/details`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!detailsResponse.data.success) {
      throw new Error('Plant details failed: ' + detailsResponse.data.message);
    }

    console.log('✅ Plant details API successful');
    const data = detailsResponse.data.data;

    // Step 3: Display month-wise tracking structure
    console.log('\n3️⃣ Month-wise Tracking History:');
    
    if (data.tracking_history_monthwise) {
      // Month 1
      console.log('\n🌱 ' + data.tracking_history_monthwise.month1.title);
      console.log('   Description: ' + data.tracking_history_monthwise.month1.description);
      data.tracking_history_monthwise.month1.weeks.forEach(week => {
        console.log(`\n   📅 ${week.week_title}:`);
        console.log(`      Due Date: ${week.due_date}`);
        console.log(`      Status: ${week.upload_status}`);
        console.log(`      Assigned Date: ${week.assigned_date}`);
        if (week.photo) {
          console.log(`      ✅ Uploaded Date: ${week.uploaded_date}`);
          console.log(`      📷 Photo ID: ${week.photo.id}`);
          console.log(`      � Photo URL: ${week.photo.photo_url}`);
          console.log(`      �📍 Location: ${week.photo.latitude}, ${week.photo.longitude}`);
        } else {
          console.log(`      ❌ Not uploaded yet`);
        }
      });

      // Month 2
      console.log('\n🌿 ' + data.tracking_history_monthwise.month2.title);
      console.log('   Description: ' + data.tracking_history_monthwise.month2.description);
      data.tracking_history_monthwise.month2.weeks.forEach(week => {
        console.log(`\n   📅 ${week.week_title}:`);
        console.log(`      Due Date: ${week.due_date}`);
        console.log(`      Status: ${week.upload_status}`);
        if (week.photo) {
          console.log(`      ✅ Uploaded Date: ${week.uploaded_date}`);
          console.log(`      📷 Photo ID: ${week.photo.id}`);
        } else {
          console.log(`      ❌ Not uploaded yet`);
        }
      });

      // Month 3
      console.log('\n🌳 ' + data.tracking_history_monthwise.month3.title);
      console.log('   Description: ' + data.tracking_history_monthwise.month3.description);
      data.tracking_history_monthwise.month3.weeks.forEach(week => {
        console.log(`\n   📅 ${week.week_title}:`);
        console.log(`      Due Date: ${week.due_date}`);
        console.log(`      Status: ${week.upload_status}`);
        if (week.photo) {
          console.log(`      ✅ Uploaded Date: ${week.uploaded_date}`);
          console.log(`      📷 Photo ID: ${week.photo.id}`);
        } else {
          console.log(`      ❌ Not uploaded yet`);
        }
      });

      console.log('\n🎉 Month-wise tracking structure is working perfectly!');
      
    } else {
      console.log('❌ Month-wise tracking not found in response');
      console.log('Available fields:', Object.keys(data));
    }

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testPlantDetails();
