const axios = require('axios');

async function testWithDetailedDebugging() {
    try {
        console.log('🔍 Testing with detailed debugging...');
        
        // Login
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'mother123',
            loginType: 'mother'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test with a simple console.log in controller to debug
        // Let me create a temporary debug version
        
        // First, let's see what req.user actually contains by making a simple test endpoint
        console.log('\n📞 Testing plant list API...');
        
        try {
            const response = await axios.get('http://localhost:3000/api/v1/mother/plants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ API worked:', response.data);
        } catch (error) {
            console.log('❌ API failed with status:', error.response?.status);
            console.log('   Error message:', error.response?.data?.message);
            console.log('   Full error data:', error.response?.data);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testWithDetailedDebugging();
