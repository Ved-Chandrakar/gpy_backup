const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testVerificationWithRemarks() {
  console.log('=== Testing Enhanced Verification API with Remarks ===');
  
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
    console.log(`   User ID: ${loginResponse.data.data.user.id}`);
    console.log(`   Name: ${loginResponse.data.data.user.name}`);
    
    // 2. Get pending verification photos
    console.log('\n2. Getting pending verification photos...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/v1/mitanin/pending-verification`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const pendingPhotos = pendingResponse.data.data.photos;
    console.log(`✅ Found ${pendingPhotos.length} pending photos`);
    
    if (pendingPhotos.length > 0) {
      const photoToVerify = pendingPhotos[0];
      console.log(`   Photo to verify: ID ${photoToVerify.id}`);
      console.log(`   Mother: ${photoToVerify.assignment.child.mother_name}`);
      console.log(`   Plant: ${photoToVerify.assignment.plant.name}`);
      
      // 3. Test verification with remarks (verified)
      console.log('\n3. Testing photo verification with positive remarks...');
      const verifyResponse = await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToVerify.id}`, {
        verification_status: 'verified',
        verification_remarks: 'Plant looks healthy and growing well. Good photo quality.',
        notes: 'Additional note: Continue regular care'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Photo verified successfully');
      console.log(`   Status: ${verifyResponse.data.data.verification_status}`);
      console.log(`   Remarks: ${verifyResponse.data.data.verification_remarks}`);
      console.log(`   Verified by: ${verifyResponse.data.data.verified_by.name}`);
      console.log(`   Verified at: ${verifyResponse.data.data.verified_at}`);
      
      // 4. Test getting another photo for rejection test
      console.log('\n4. Getting another photo for rejection test...');
      const pendingResponse2 = await axios.get(`${BASE_URL}/api/v1/mitanin/pending-verification`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const remainingPhotos = pendingResponse2.data.data.photos;
      if (remainingPhotos.length > 0) {
        const photoToReject = remainingPhotos[0];
        console.log(`   Photo to reject: ID ${photoToReject.id}`);
        
        // 5. Test rejection with remarks
        console.log('\n5. Testing photo rejection with remarks...');
        const rejectResponse = await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToReject.id}`, {
          verification_status: 'rejected',
          verification_remarks: 'Photo is blurry and plant condition is unclear. Please retake with better lighting and focus.'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Photo rejected successfully');
        console.log(`   Status: ${rejectResponse.data.data.verification_status}`);
        console.log(`   Remarks: ${rejectResponse.data.data.verification_remarks}`);
        console.log(`   Verified by: ${rejectResponse.data.data.verified_by.name}`);
      }
      
      // 6. Test rejection without remarks (should fail)
      if (remainingPhotos.length > 1) {
        console.log('\n6. Testing rejection without remarks (should fail)...');
        try {
          const photoToReject2 = remainingPhotos[1];
          await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToReject2.id}`, {
            verification_status: 'rejected'
            // No verification_remarks provided
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('❌ Should have failed but didn\'t');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log('✅ Correctly rejected rejection without remarks');
            console.log(`   Error: ${error.response.data.message}`);
          } else {
            console.log('❌ Unexpected error:', error.message);
          }
        }
      }
    }
    
    console.log('\n=== Verification with Remarks Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVerificationWithRemarks();
