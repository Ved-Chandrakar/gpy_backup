const axios = require('axios');

async function testAllAdminPages() {
  try {
    console.log('🔐 Testing all admin pages...');
    
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
      withCredentials: true,
      timeout: 10000
    });

    console.log('1. Testing login page...');
    const loginPageResponse = await axiosInstance.get('/admin/login');
    console.log(`   ✅ Login page: ${loginPageResponse.status}`);

    console.log('2. Performing admin login...');
    const loginResponse = await axiosInstance.post('/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log(`   ✅ Login: ${loginResponse.status}`);

    console.log('3. Testing dashboard...');
    try {
      const dashboardResponse = await axiosInstance.get('/admin/');
      console.log(`   ✅ Dashboard: ${dashboardResponse.status}`);
    } catch (dashError) {
      console.log(`   ❌ Dashboard error: ${dashError.response?.status || dashError.message}`);
    }

    console.log('4. Testing users page...');
    try {
      const usersResponse = await axiosInstance.get('/admin/users');
      console.log(`   ✅ Users page: ${usersResponse.status}`);
      console.log(`   📊 Response size: ${usersResponse.data.length} bytes`);
    } catch (usersError) {
      console.log(`   ❌ Users page error: ${usersError.response?.status || usersError.message}`);
    }

    console.log('5. Testing mothers page...');
    try {
      const mothersResponse = await axiosInstance.get('/admin/mothers');
      console.log(`   ✅ Mothers page: ${mothersResponse.status}`);
    } catch (mothersError) {
      console.log(`   ❌ Mothers page error: ${mothersError.response?.status || mothersError.message}`);
    }

    console.log('6. Testing plants page...');
    try {
      const plantsResponse = await axiosInstance.get('/admin/plants');
      console.log(`   ✅ Plants page: ${plantsResponse.status}`);
    } catch (plantsError) {
      console.log(`   ❌ Plants page error: ${plantsError.response?.status || plantsError.message}`);
    }

    console.log('7. Testing reports page...');
    try {
      const reportsResponse = await axiosInstance.get('/admin/reports');
      console.log(`   ✅ Reports page: ${reportsResponse.status}`);
    } catch (reportsError) {
      console.log(`   ❌ Reports page error: ${reportsError.response?.status || reportsError.message}`);
    }

  } catch (error) {
    console.log('❌ Error in admin testing:');
    console.log(`   ${error.message}`);
  }
  
  console.log('🏁 Admin pages test completed');
}

testAllAdminPages();
