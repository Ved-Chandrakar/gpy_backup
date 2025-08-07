/**
 * Simple Password Reset Test Script
 * Tests the new /api/v1/auth/reset-password-simple endpoint
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';

const testPasswordReset = async (userId) => {
  console.log(`🔒 Testing Password Reset for User: ${userId}...\n`);

  try {
    const response = await axios.post(`${BASE_URL}/auth/reset-password-simple`, {
      userId: userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 Password reset successfully!');
      console.log(`🔑 New Password: ${response.data.data.newPassword}`);
      console.log(`👤 User ID: ${response.data.data.userId}`);
      console.log(`📱 Mobile: ${response.data.data.mobile}`);
    } else {
      console.log('\n❌ Password reset failed');
    }

  } catch (error) {
    console.error('❌ Error testing password reset:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Helper to generate curl command
const generateCurlCommand = (userId) => {
  console.log('\n📋 Curl Command for Testing:');
  console.log(`Replace 'user123' with actual userId:\n`);
  
  const curlCommand = `curl -X POST "${BASE_URL}/auth/reset-password-simple" \\
-H "Content-Type: application/json" \\
-d '{
  "userId": "${userId}"
}'`;

  console.log(curlCommand);
};

// Example usage
const testUserId = 'user123'; // Replace with actual user ID

console.log('🔒 Simple Password Reset API Test\n');
console.log('📝 This endpoint resets any user password to: gpy@2025');
console.log('⚠️  No authentication token required!\n');

// Show curl example
generateCurlCommand(testUserId);

// Uncomment to run actual test
// testPasswordReset(testUserId);
