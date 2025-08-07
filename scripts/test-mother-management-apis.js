const axios = require('axios');

// Base configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const HOSPITAL_CREDENTIALS = {
  userId: 'H001',
  password: 'password123',
  loginType: 'web'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, params = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      params
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error (${error.response.status}):`, error.response.data);
      return error.response.data;
    } else {
      console.error('❌ Network Error:', error.message);
      throw error;
    }
  }
};

// Test login and get token
const testLogin = async () => {
  try {
    console.log('🔐 Testing hospital login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, HOSPITAL_CREDENTIALS);
    
    if (response.data.success && response.data.data?.token) {
      authToken = response.data.data.token;
      console.log('✅ Hospital login successful');
      console.log(`   Hospital: ${response.data.data.user.name}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      return true;
    } else {
      console.error('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return false;
  }
};

// Test getting mothers list
const testGetMothersList = async () => {
  try {
    console.log('\n📋 Testing mothers list API...');
    
    // Test with default parameters
    console.log('   Testing default parameters...');
    const defaultList = await makeRequest('GET', '/hospital/mothers');
    
    if (defaultList.success) {
      console.log(`✅ Default list retrieved: ${defaultList.data.mothers.length} mothers`);
      console.log(`   Total records: ${defaultList.data.pagination.total_records}`);
      console.log(`   Current page: ${defaultList.data.pagination.current_page}`);
      console.log(`   Total pages: ${defaultList.data.pagination.total_pages}`);
      
      if (defaultList.data.mothers.length > 0) {
        const firstMother = defaultList.data.mothers[0];
        console.log(`   First mother: ${firstMother.mother_name} (Child ID: ${firstMother.child_id})`);
      }
    } else {
      console.error('❌ Default list failed:', defaultList);
    }

    // Test with pagination
    console.log('\n   Testing pagination (page 1, limit 3)...');
    const paginatedList = await makeRequest('GET', '/hospital/mothers', null, {
      page: 1,
      limit: 3
    });
    
    if (paginatedList.success) {
      console.log(`✅ Paginated list retrieved: ${paginatedList.data.mothers.length} mothers (limit 3)`);
      console.log(`   Has next page: ${paginatedList.data.pagination.has_next_page}`);
    }

    // Test with search
    console.log('\n   Testing search functionality...');
    const searchList = await makeRequest('GET', '/hospital/mothers', null, {
      search: 'Priya',
      limit: 5
    });
    
    if (searchList.success) {
      console.log(`✅ Search results: ${searchList.data.mothers.length} mothers found for "Priya"`);
      searchList.data.mothers.forEach(mother => {
        console.log(`      - ${mother.mother_name} (${mother.mother_mobile})`);
      });
    }

    // Test with sorting
    console.log('\n   Testing sorting (by mother_name ASC)...');
    const sortedList = await makeRequest('GET', '/hospital/mothers', null, {
      sort_by: 'mother_name',
      sort_order: 'ASC',
      limit: 5
    });
    
    if (sortedList.success) {
      console.log(`✅ Sorted list retrieved: ${sortedList.data.mothers.length} mothers (by name ASC)`);
      sortedList.data.mothers.forEach(mother => {
        console.log(`      - ${mother.mother_name}`);
      });
    }

    return defaultList.data?.mothers || [];

  } catch (error) {
    console.error('❌ Mothers list test error:', error);
    return [];
  }
};

// Test getting specific mother details
const testGetMotherInfo = async (mothers) => {
  try {
    console.log('\n👤 Testing mother info API...');
    
    if (mothers.length === 0) {
      console.log('   No mothers found to test with');
      return;
    }

    // Test with first mother
    const firstMother = mothers[0];
    console.log(`   Testing with Child ID: ${firstMother.child_id} (${firstMother.mother_name})`);
    
    const motherInfo = await makeRequest('GET', `/hospital/mothers/${firstMother.child_id}`);
    
    if (motherInfo.success) {
      console.log('✅ Mother details retrieved successfully');
      console.log(`   Child Name: ${motherInfo.data.child_info.child_name}`);
      console.log(`   Mother Name: ${motherInfo.data.child_info.mother_name}`);
      console.log(`   Mobile: ${motherInfo.data.child_info.mother_mobile}`);
      console.log(`   Gender: ${motherInfo.data.child_info.child_gender}`);
      console.log(`   Delivery Date: ${motherInfo.data.child_info.delivery_date}`);
      
      if (motherInfo.data.location_details.district) {
        console.log(`   District: ${motherInfo.data.location_details.district.district_name}`);
      }
      if (motherInfo.data.location_details.block) {
        console.log(`   Block: ${motherInfo.data.location_details.block.block_name}`);
      }
      if (motherInfo.data.location_details.village) {
        console.log(`   Village: ${motherInfo.data.location_details.village.village_name}`);
      }
      
      if (motherInfo.data.user_account) {
        console.log(`   User ID: ${motherInfo.data.user_account.userid}`);
        console.log(`   Password Changed: ${motherInfo.data.user_account.is_password_changed}`);
        console.log(`   Account Active: ${motherInfo.data.user_account.is_active}`);
      }
    } else {
      console.error('❌ Mother info failed:', motherInfo);
    }

    // Test with invalid child ID
    console.log('\n   Testing with invalid child ID (99999)...');
    const invalidInfo = await makeRequest('GET', '/hospital/mothers/99999');
    
    if (!invalidInfo.success && invalidInfo.message.includes('not found')) {
      console.log('✅ Invalid child ID properly rejected');
    } else {
      console.error('❌ Invalid child ID test failed:', invalidInfo);
    }

    // Test with non-numeric child ID
    console.log('\n   Testing with non-numeric child ID...');
    const nonNumericInfo = await makeRequest('GET', '/hospital/mothers/abc');
    
    if (!nonNumericInfo.success && nonNumericInfo.message.includes('Valid child_id')) {
      console.log('✅ Non-numeric child ID properly rejected');
    } else {
      console.error('❌ Non-numeric child ID test failed:', nonNumericInfo);
    }

  } catch (error) {
    console.error('❌ Mother info test error:', error);
  }
};

// Test edge cases and error handling
const testEdgeCases = async () => {
  try {
    console.log('\n🧪 Testing edge cases...');
    
    // Test mothers list with very large page number
    console.log('   Testing large page number...');
    const largePage = await makeRequest('GET', '/hospital/mothers', null, { page: 999 });
    if (largePage.success) {
      console.log(`✅ Large page handled: ${largePage.data.mothers.length} mothers returned`);
    }

    // Test mothers list with invalid limit
    console.log('   Testing large limit (should be capped at 50)...');
    const largeLimit = await makeRequest('GET', '/hospital/mothers', null, { limit: 1000 });
    if (largeLimit.success) {
      console.log(`✅ Large limit capped: returned ${largeLimit.data.mothers.length} mothers (max 50)`);
    }

    // Test empty search
    console.log('   Testing empty search...');
    const emptySearch = await makeRequest('GET', '/hospital/mothers', null, { search: 'xxxxxxxxx' });
    if (emptySearch.success) {
      console.log(`✅ Empty search handled: ${emptySearch.data.mothers.length} mothers found`);
    }

  } catch (error) {
    console.error('❌ Edge cases test error:', error);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Hospital Mother Management APIs Test');
  console.log('='.repeat(60));

  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Test mothers list API
  const mothers = await testGetMothersList();

  // Test mother info API
  await testGetMotherInfo(mothers);

  // Test edge cases
  await testEdgeCases();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Hospital Mother Management APIs tests completed!');
};

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
