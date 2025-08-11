const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function updateUserPassword() {
  try {
    console.log('🔑 Updating user password...');
    
    // Find the user
    const user = await User.findOne({ where: { userid: 'H001' } });
    if (!user) {
      throw new Error('User H001 not found');
    }
    
    // Update password manually (bypass bcrypt hooks for testing)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.update(
      { password: hashedPassword },
      { 
        where: { userid: 'H001' },
        individualHooks: false // Skip bcrypt hooks
      }
    );
    
    console.log('✅ Password updated for user H001');
    console.log('📋 Test login credentials:');
    console.log('   userid: H001');
    console.log('   password: password123');
    
  } catch (error) {
    console.error('❌ Password update failed:', error.message);
  }
}

updateUserPassword();
