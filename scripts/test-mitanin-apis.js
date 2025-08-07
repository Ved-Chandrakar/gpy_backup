const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test data - need to create a mitanin user or use existing one
const mitaninLoginData = {
  userId: 'mitanin001', // This should be a valid mitanin userid
  password: 'gpy@2025', // Updated password
  loginType: 'mitanin'
};

async function testMitaninAPIs() {
  try {
    console.log('=== Testing Mitanin APIs ===\n');

    // 1. Login as mitanin
    console.log('1. Logging in as mitanin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, mitaninLoginData);
    
    if (!loginResponse.data.success) {
      throw new Error('Mitanin login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.access_token || loginResponse.data.data.token;
    const mitaninUser = loginResponse.data.data.user;
    console.log('✅ Mitanin login successful');
    console.log('   User ID:', mitaninUser.id);
    console.log('   Name:', mitaninUser.name);
    console.log('   Hospital ID:', mitaninUser.hospital_id);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test mitanin dashboard
    console.log('\n2. Testing mitanin dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/mitanin/dashboard`, { headers });
      
      if (dashboardResponse.data.success) {
        console.log('✅ Mitanin dashboard API response received');
        const counters = dashboardResponse.data.data.counters;
        console.log('   Dashboard Counters:');
        console.log('   - Total Pending Verification:', counters.total_pending_verification);
        console.log('   - Total Verification Photos:', counters.total_verification_photos);
        console.log('   - Total Verified Photos:', counters.total_verified_photos);
        console.log('   - Total Mothers:', counters.total_mothers);
        console.log('   - Hospital ID:', dashboardResponse.data.data.hospital_id);
      } else {
        console.log('❌ Dashboard API failed:', dashboardResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Dashboard API error:', error.response?.data?.message || error.message);
    }

    // 3. Test pending verification photos
    console.log('\n3. Testing pending verification photos...');
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/mitanin/pending-verification?page=1&limit=5`, { headers });
      
      if (pendingResponse.data.success) {
        console.log('✅ Pending verification photos API response received');
        const photos = pendingResponse.data.data.photos;
        const pagination = pendingResponse.data.data.pagination;
        
        console.log(`   Found ${pagination.total_records} pending photos (showing ${photos.length})`);
        
        if (photos.length > 0) {
          console.log('   Sample pending photo:');
          const photo = photos[0];
          console.log('   - Photo ID:', photo.id);
          console.log('   - Photo URL:', photo.photo_url);
          console.log('   - Mother Name:', photo.assignment?.child?.mother_name);
          console.log('   - Child Name:', photo.assignment?.child?.child_name);
          console.log('   - Plant Name:', photo.assignment?.plant?.name);
          console.log('   - Upload Date:', photo.upload_date);
          console.log('   - Is Verified:', photo.is_verified);
        } else {
          console.log('   No pending photos found');
        }
      } else {
        console.log('❌ Pending verification API failed:', pendingResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Pending verification API error:', error.response?.data?.message || error.message);
    }

    // 4. Test all verification photos
    console.log('\n4. Testing all verification photos...');
    try {
      const allPhotosResponse = await axios.get(`${BASE_URL}/mitanin/verification-photos?page=1&limit=5`, { headers });
      
      if (allPhotosResponse.data.success) {
        console.log('✅ All verification photos API response received');
        const photos = allPhotosResponse.data.data.photos;
        const pagination = allPhotosResponse.data.data.pagination;
        
        console.log(`   Found ${pagination.total_records} total photos (showing ${photos.length})`);
        console.log('   Filter applied:', allPhotosResponse.data.data.filter);
        
        if (photos.length > 0) {
          const verifiedCount = photos.filter(p => p.is_verified).length;
          const pendingCount = photos.filter(p => !p.is_verified).length;
          console.log(`   - Verified: ${verifiedCount}, Pending: ${pendingCount}`);
        }
      } else {
        console.log('❌ All verification photos API failed:', allPhotosResponse.data.message);
      }
    } catch (error) {
      console.log('❌ All verification photos API error:', error.response?.data?.message || error.message);
    }

    // 5. Test verification (if there are pending photos)
    console.log('\n5. Testing photo verification...');
    try {
      // First get a pending photo
      const pendingResponse = await axios.get(`${BASE_URL}/mitanin/pending-verification?page=1&limit=1`, { headers });
      
      if (pendingResponse.data.success && pendingResponse.data.data.photos.length > 0) {
        const photoToVerify = pendingResponse.data.data.photos[0];
        console.log(`   Found photo to verify: ID ${photoToVerify.id}`);
        
        // Verify the photo
        const verificationData = {
          verification_status: 'verified',
          notes: 'Plant looks healthy and growing well - verified via test script'
        };
        
        const verifyResponse = await axios.put(
          `${BASE_URL}/mitanin/verify-photo/${photoToVerify.id}`, 
          verificationData, 
          { headers }
        );
        
        if (verifyResponse.data.success) {
          console.log('✅ Photo verification successful');
          console.log('   Verification Status:', verifyResponse.data.data.verification_status);
          console.log('   Verified By:', verifyResponse.data.data.verified_by.name);
        } else {
          console.log('❌ Photo verification failed:', verifyResponse.data.message);
        }
      } else {
        console.log('   No pending photos found to verify');
      }
    } catch (error) {
      console.log('❌ Photo verification error:', error.response?.data?.message || error.message);
    }

    console.log('\n=== Mitanin API Tests Complete ===');

  } catch (error) {
    console.error('❌ Error during mitanin API test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Additional function to create a test mitanin user if needed
async function createTestMitanin() {
  try {
    console.log('=== Creating Test Mitanin User ===\n');
    
    // This would typically be done through admin APIs or database scripts
    console.log('Note: This is a placeholder for mitanin user creation');
    console.log('You may need to create a mitanin user in the database manually');
    console.log('Required fields:');
    console.log('- userid: mitanin001');
    console.log('- password: mitanin001 (hashed)');
    console.log('- role_id: (mitanin role ID)');
    console.log('- hospital_id: (assigned hospital)');
    console.log('- name: Test Mitanin');
    console.log('- is_active: true');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run tests
console.log('Starting Mitanin API tests...\n');
testMitaninAPIs();

// Uncomment to create test mitanin user
// createTestMitanin();
