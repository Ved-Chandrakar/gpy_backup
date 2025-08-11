const { User } = require('../models');
const bcrypt = require('bcryptjs');

const checkPassword = async () => {
  try {
    console.log('🔐 Checking hospital user password...');
    
    // Get hospital user
    const user = await User.findOne({
      where: { userid: 'H001' },
      attributes: ['userid', 'password', 'name']
    });

    if (!user) {
      console.log('❌ User H003 not found');
      return;
    }

    console.log(`✅ Found user: ${user.name}`);
    console.log(`   User ID: ${user.userid}`);
    console.log(`   Password hash: ${user.password}`);
    
    // Test if it's a bcrypt hash
    const isBcryptHash = user.password.startsWith('$2');
    console.log(`   Is bcrypt hash: ${isBcryptHash}`);
    
    if (isBcryptHash) {
      // Test common passwords
      const testPasswords = ['password123', 'admin123', 'hospital123', 'H003', user.userid];
      
      console.log('\n🧪 Testing common passwords...');
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`   "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        
        if (isMatch) {
          console.log(`\n💡 Use this password for testing: "${testPassword}"`);
          break;
        }
      }
    } else {
      console.log('\n💡 Password appears to be plain text');
    }

  } catch (error) {
    console.error('❌ Error checking password:', error.message);
  }
};

checkPassword().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
