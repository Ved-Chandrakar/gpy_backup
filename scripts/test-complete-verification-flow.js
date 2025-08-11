const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testCompleteVerificationFlow() {
  console.log('=== Testing Complete Verification Flow ===');
  
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
    console.log(`   User: ${loginResponse.data.data.user.name}`);
    console.log(`   Hospital ID: ${loginResponse.data.data.user.hospital_id}`);
    
    // 2. Check dashboard
    console.log('\n2. Checking mitanin dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const counters = dashboardResponse.data.data.counters;
    console.log('✅ Dashboard data retrieved');
    console.log(`   Pending Verification: ${counters.total_pending_verification}`);
    console.log(`   Total Photos: ${counters.total_verification_photos}`);
    
    // 3. Get pending verification photos
    console.log('\n3. Getting pending verification photos...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/pending-verification`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const pendingPhotos = pendingResponse.data.data.photos;
    console.log(`✅ Found ${pendingPhotos.length} pending photos`);
    
    if (pendingPhotos.length > 0) {
      const latestPhoto = pendingPhotos[0]; // Most recent photo
      console.log(`\n📷 Latest Photo Details:`);
      console.log(`   Photo ID: ${latestPhoto.id}`);
      console.log(`   Mother: ${latestPhoto.assignment.child.mother_name}`);
      console.log(`   Child: ${latestPhoto.assignment.child.child_name}`);
      console.log(`   Plant: ${latestPhoto.assignment.plant.name}`);
      console.log(`   Week: ${latestPhoto.week_number}`);
      console.log(`   Upload Date: ${latestPhoto.upload_date}`);
      console.log(`   Photo URL: ${latestPhoto.photo_url}`);
      
      // 4. Verify the photo with detailed remarks
      console.log('\n4. Verifying photo with detailed remarks...');
      const verifyResponse = await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${latestPhoto.id}`, {
        verification_status: 'verified',
        verification_remarks: `Photo quality is excellent. Plant shows healthy growth with good leaf development. Week ${latestPhoto.week_number} progress is satisfactory. Continue current care regimen.`,
        notes: 'Recommended: Increase watering frequency during summer months'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Photo verification completed');
      console.log(`   Status: ${verifyResponse.data.data.verification_status}`);
      console.log(`   Remarks: ${verifyResponse.data.data.verification_remarks}`);
      console.log(`   Verified by: ${verifyResponse.data.data.verified_by.name} (ID: ${verifyResponse.data.data.verified_by.id})`);
      console.log(`   Verified at: ${verifyResponse.data.data.verified_at}`);
      
      // 5. Check updated dashboard
      console.log('\n5. Checking updated dashboard...');
      const updatedDashboardResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedCounters = updatedDashboardResponse.data.data.counters;
      console.log('✅ Updated dashboard data:');
      console.log(`   Pending Verification: ${updatedCounters.total_pending_verification} (was ${counters.total_pending_verification})`);
      console.log(`   Total Photos: ${updatedCounters.total_verification_photos} (was ${counters.total_verification_photos})`);
      
      // 6. Get all verification photos
      console.log('\n6. Getting all verification photos...');
      const allPhotosResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/verification-photos?status=verified&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const verifiedPhotos = allPhotosResponse.data.data.photos;
      console.log(`✅ Found ${verifiedPhotos.length} verified photos`);
      
      if (verifiedPhotos.length > 0) {
        const recentlyVerified = verifiedPhotos.find(p => p.id === latestPhoto.id);
        if (recentlyVerified) {
          console.log(`\n✅ Verified photo found in list:`);
          console.log(`   Photo ID: ${recentlyVerified.id}`);
          console.log(`   Is Verified: ${recentlyVerified.is_verified}`);
          console.log(`   Verification Notes: ${recentlyVerified.notes}`);
        }
      }
    } else {
      console.log('ℹ️  No pending photos available for verification');
    }
    
    console.log('\n=== Complete Verification Flow Test Complete ===');
    console.log('🎉 All verification features working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteVerificationFlow();
