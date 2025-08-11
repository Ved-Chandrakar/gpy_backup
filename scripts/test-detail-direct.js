const axios = require('axios');

async function testDetailAPIDirectly() {
    try {
        console.log('🔍 Testing Detail API directly...');
        
        // Login
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'mother123',
            loginType: 'mother'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test detail API with the assignment we created (ID: 22)
        console.log('\n🔍 Testing detail API with assignment ID: 22');
        
        try {
            const detailResponse = await axios.get('http://localhost:3000/api/v1/mother/plants/22/details', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (detailResponse.data.success) {
                console.log('✅ Detail API working!');
                console.log('📊 Plant details:', JSON.stringify(detailResponse.data.data, null, 2));
            } else {
                console.log('❌ Detail API failed:', detailResponse.data.message);
            }
            
        } catch (detailError) {
            console.log('❌ Detail API error:');
            console.log('   Status:', detailError.response?.status);
            console.log('   Message:', detailError.response?.data?.message || detailError.message);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testDetailAPIDirectly();
