const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testVerificationValidation() {
  console.log('=== Testing Verification Validation ===');
  
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
      const photoToTest = pendingPhotos[0];
      
      // 3. Test rejection without remarks (should fail)
      console.log('\n3. Testing rejection without remarks (should fail)...');
      try {
        await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToTest.id}`, {
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
      
      // 4. Test invalid verification status
      console.log('\n4. Testing invalid verification status...');
      try {
        await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToTest.id}`, {
          verification_status: 'invalid_status',
          verification_remarks: 'Some remarks'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ Should have failed but didn\'t');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Correctly rejected invalid verification status');
          console.log(`   Error: ${error.response.data.message}`);
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
      
      // 5. Test verification with proper remarks
      console.log('\n5. Testing verification with proper remarks...');
      const verifyResponse = await axios.put(`${BASE_URL}/api/v1/mitanin/verify-photo/${photoToTest.id}`, {
        verification_status: 'verified',
        verification_remarks: 'Plant is growing well and looks healthy.',
        notes: 'Continue current care routine'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Photo verified successfully');
      console.log(`   Status: ${verifyResponse.data.data.verification_status}`);
      console.log(`   Remarks: ${verifyResponse.data.data.verification_remarks}`);
      console.log(`   Verified by: ${verifyResponse.data.data.verified_by.name}`);
      console.log(`   Verified at: ${verifyResponse.data.data.verified_at}`);
      
    } else {
      console.log('ℹ️  No pending photos available for testing');
    }
    
    console.log('\n=== Verification Validation Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVerificationValidation();
