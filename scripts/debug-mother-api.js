const axios = require('axios');

async function debugMotherAPI() {
    try {
        console.log('🔍 Debugging mother API...');
        
        // Login as mother
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'mother123',
            loginType: 'mother'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        console.log('🔑 Token:', token.substring(0, 20) + '...');
        
        // Test the API with detailed error handling
        try {
            console.log('📞 Calling plant tracking API...');
            const response = await axios.get('http://localhost:3000/api/v1/mother/plants', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            console.log('✅ API Response Status:', response.status);
            console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
            
        } catch (apiError) {
            console.log('❌ API Error Details:');
            console.log('   Status:', apiError.response?.status);
            console.log('   Status Text:', apiError.response?.statusText);
            console.log('   Data:', apiError.response?.data);
            console.log('   Message:', apiError.message);
            
            if (apiError.response?.status === 500) {
                console.log('\n🔧 Server error detected. Check these common issues:');
                console.log('   1. Database connection');
                console.log('   2. Model associations');
                console.log('   3. Field name mismatches');
                console.log('   4. Missing includes in queries');
            }
        }
        
    } catch (error) {
        console.log('❌ Debug failed:', error.message);
    }
}

debugMotherAPI();
