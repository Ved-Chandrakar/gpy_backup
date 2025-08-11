const { User, Role } = require('../models');
const { sequelize } = require('../config/database');

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');
    
    // Find the hospital role
    const hospitalRole = await Role.findOne({ where: { name: 'hospital' } });
    if (!hospitalRole) {
      throw new Error('Hospital role not found');
    }
    
    // Create a test user
    const testUser = await User.create({
      userid: 'H001',
      name: 'Test Hospital User',
      mobile: '9999999999',
      email: 'test@hospital.com',
      password: 'password123',
      role_id: hospitalRole.id,
      district_id: 1,
      hospital_name: 'Test Hospital'
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      userid: testUser.userid,
      name: testUser.name,
      mobile: testUser.mobile,
      role_id: testUser.role_id
    });
    
    console.log('🎉 Test user creation completed!');
    console.log('📋 Test login credentials:');
    console.log('   userid: H001');
    console.log('   password: password123');
    
  } catch (error) {
    console.error('❌ Test user creation failed:', error);
    
    // If the error is duplicate entry, that's okay
    if (error.original && error.original.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️ Test user already exists');
      console.log('📋 Test login credentials:');
      console.log('   userid: H001');
      console.log('   password: password123');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// Run the test user creation
createTestUser().catch(console.error);
