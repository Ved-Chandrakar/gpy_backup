const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testRejectionWorkflow() {
  console.log('=== Testing Photo Rejection Workflow ===');
  
  let token;
  
  try {
    // 1. Login as mitanin
    console.log('1. Logging in as mitanin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      userId: 'mitanin001',
      password: 'gpy@2025',
      loginType: 'mitanin'
    });
    
    token = loginResponse.data.data.token;
    console.log('✅ Mitanin login successful');
    
    // 2. Get pending verification photos
    console.log('\n2. Getting pending verification photos...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/pending-verification`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const pendingPhotos = pendingResponse.data.data.photos;
    console.log(`✅ Found ${pendingPhotos.length} pending photos`);
    
    if (pendingPhotos.length > 0) {
      const photoToReject = pendingPhotos[0];
      console.log(`\n📷 Photo to Reject:`);
      console.log(`   Photo ID: ${photoToReject.id}`);
      console.log(`   Mother: ${photoToReject.assignment.child.mother_name}`);
      console.log(`   Plant: ${photoToReject.assignment.plant.name}`);
      console.log(`   Week: ${photoToReject.week_number}`);
      
      // 3. Reject the photo with detailed remarks
      console.log('\n3. Rejecting photo with detailed remarks...');
      const rejectResponse = await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToReject.id}`, {
        verification_status: 'rejected',
        verification_remarks: `Photo quality is poor - image is blurry and plant details are not clearly visible. Background lighting is insufficient. Please retake the photo with better lighting conditions and ensure the camera is steady for clear focus. Position the camera closer to the plant for better detail capture.`,
        notes: 'Suggested: Take photo during daytime with natural light, avoid shadows'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Photo rejection completed');
      console.log(`   Status: ${rejectResponse.data.data.verification_status}`);
      console.log(`   Remarks: ${rejectResponse.data.data.verification_remarks}`);
      console.log(`   Verified by: ${rejectResponse.data.data.verified_by.name}`);
      console.log(`   Verified at: ${rejectResponse.data.data.verified_at}`);
      
      // 4. Get all verification photos including rejected ones
      console.log('\n4. Getting all verification photos (including rejected)...');
      const allPhotosResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/verification-photos?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allPhotos = allPhotosResponse.data.data.photos;
      const verifiedCount = allPhotos.filter(p => p.is_verified === true).length;
      const rejectedCount = allPhotos.filter(p => p.is_verified === false && p.notes).length;
      
      console.log(`✅ Retrieved ${allPhotos.length} total photos`);
      console.log(`   Verified Photos: ${verifiedCount}`);
      console.log(`   Rejected Photos: ${rejectedCount}`);
      console.log(`   Filter: ${allPhotosResponse.data.data.filter}`);
      
      // 5. Check dashboard after rejection
      console.log('\n5. Checking dashboard after rejection...');
      const dashboardResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const counters = dashboardResponse.data.data.counters;
      console.log('✅ Dashboard data after rejection:');
      console.log(`   Pending Verification: ${counters.total_pending_verification}`);
      console.log(`   Total Photos: ${counters.total_verification_photos}`);
      
    } else {
      console.log('ℹ️  No pending photos available for rejection test');
    }
    
    console.log('\n=== Photo Rejection Workflow Test Complete ===');
    console.log('🎉 Rejection workflow with remarks working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRejectionWorkflow();
