/**
 * Simple Push Notification Test Script
 * Tests the new /api/v1/fcm/send-test endpoint
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_DEVICE_TOKEN = 'your-actual-fcm-device-token-here'; // Replace with real token
const AUTH_TOKEN = 'your-jwt-auth-token-here'; // Replace with valid auth token

const testPushNotification = async () => {
  console.log('🔥 Testing Simple Push Notification API...\n');

  try {
    const response = await axios.post(`${BASE_URL}/fcm/send-test`, {
      title: 'Hello from Green Paalna Yojna!',
      body: 'This is a test notification sent directly to your device 📱',
      device_token: TEST_DEVICE_TOKEN,
      data: {
        test: true,
        feature: 'simple_test_api',
        timestamp: new Date().toISOString()
      },
      priority: 'high',
      sound: 'default'
    }, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 Test notification sent successfully!');
      console.log('📱 Check your device for the notification.');
    } else {
      console.log('\n❌ Failed to send notification');
    }

  } catch (error) {
    console.error('❌ Error testing push notification:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Helper to test with curl command
const generateCurlCommand = () => {
  console.log('\n📋 Curl Command for Testing:');
  console.log('Replace YOUR_AUTH_TOKEN and YOUR_DEVICE_TOKEN with actual values:\n');
  
  const curlCommand = `curl -X POST "${BASE_URL}/fcm/send-test" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_AUTH_TOKEN" \\
-d '{
  "title": "Test Notification",
  "body": "Testing push notification!",
  "device_token": "YOUR_DEVICE_TOKEN",
  "data": {"test": true},
  "priority": "high"
}'`;

  console.log(curlCommand);
};

// Run the test
console.log('📝 Instructions:');
console.log('1. Replace TEST_DEVICE_TOKEN with your actual FCM token');
console.log('2. Replace AUTH_TOKEN with your valid JWT token');
console.log('3. Run: node scripts/test-simple-push.js\n');

// Show curl example
generateCurlCommand();

// Uncomment to run the actual test
// testPushNotification();
