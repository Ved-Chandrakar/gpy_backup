/**
 * Check Current User Table State
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');

const checkCurrentState = async () => {
  try {
    console.log('🔍 Checking current user table state...\n');

    // Check user count
    const userCount = await User.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.findAll({ 
        attributes: ['id', 'userid', 'name', 'role_id'],
        limit: 10
      });
      console.log('\n📋 Existing users:');
      users.forEach(user => {
        console.log(`- ${user.userid}: ${user.name} (role: ${user.role_id})`);
      });
    } else {
      console.log('✅ User table is empty - ready for seeding');
    }

    // Check available roles
    console.log('\n📋 Available roles:');
    const roles = await Role.findAll({ attributes: ['id', 'name'] });
    roles.forEach(role => {
      console.log(`- ${role.id}: ${role.name}`);
    });

    // Check master data
    console.log('\n📋 Master data availability:');
    
    // Check districts
    const [districts] = await sequelize.query('SELECT COUNT(*) as count FROM master_district');
    console.log(`- Districts: ${districts[0].count}`);
    
    // Check blocks  
    const [blocks] = await sequelize.query('SELECT COUNT(*) as count FROM master_block');
    console.log(`- Blocks: ${blocks[0].count}`);
    
    // Check villages
    const [villages] = await sequelize.query('SELECT COUNT(*) as count FROM master_village');
    console.log(`- Villages: ${villages[0].count}`);

  } catch (error) {
    console.error('❌ Error checking state:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkCurrentState();
