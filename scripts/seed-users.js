/**
 * Seed State, District, and Hospital Users
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding process...\n');

    // Default password for all users
    const defaultPassword = 'gpy@2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Create State Level User
    console.log('📍 Creating State Level User...');
    const stateUser = await User.create({
      userid: 'CG-STATE-001',
      name: 'Chhattisgarh State Administrator',
      mobile: '9999000001',
      email: 'state.admin@cg.gov.in',
      password: hashedPassword,
      role_id: 1, // state role
      district_id: null,
      block_id: null,
      hospital_id: null,
      hospital_name: null,
      is_active: 1,
      is_password_changed: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`✅ Created state user: ${stateUser.userid} - ${stateUser.name}`);

    // 2. Create District Level Users (sample districts)
    console.log('\n📍 Creating District Level Users...');
    
    // Get some sample districts
    const [districts] = await sequelize.query(`
      SELECT district_code, district_name 
      FROM master_district 
      ORDER BY district_name 
      LIMIT 5
    `);

    const districtUsers = [];
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      const districtUser = await User.create({
        userid: `CG-DIST-${district.district_code.toString().padStart(3, '0')}`,
        name: `${district.district_name} District Collector`,
        mobile: `999900${(i + 2).toString().padStart(4, '0')}`,
        email: `collector.${district.district_name.toLowerCase().replace(/\s+/g, '')}@cg.gov.in`,
        password: hashedPassword,
        role_id: 2, // collector role
        district_id: district.district_code,
        block_id: null,
        hospital_id: null,
        hospital_name: null,
        is_active: 1,
        is_password_changed: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      districtUsers.push(districtUser);
      console.log(`✅ Created district user: ${districtUser.userid} - ${districtUser.name}`);
    }

    // 3. Create Hospital Users (sample hospitals)
    console.log('\n🏥 Creating Hospital Users...');
    
    // Get some sample districts for hospital placement
    const [hospitalDistricts] = await sequelize.query(`
      SELECT district_code, district_name 
      FROM master_district 
      ORDER BY district_name 
      LIMIT 3
    `);

    const hospitalUsers = [];
    for (let i = 0; i < hospitalDistricts.length; i++) {
      const district = hospitalDistricts[i];
      
      // Create CHC (Community Health Center)
      const chcUser = await User.create({
        userid: `CG-CHC-${district.district_code.toString().padStart(3, '0')}-001`,
        name: `CHC ${district.district_name} - Dr. ${['Sharma', 'Verma', 'Singh'][i]}`,
        mobile: `999901${(i + 1).toString().padStart(4, '0')}`,
        email: `chc.${district.district_name.toLowerCase().replace(/\s+/g, '')}.001@cg.gov.in`,
        password: hashedPassword,
        role_id: 3, // hospital role
        district_id: district.district_code,
        block_id: null,
        hospital_id: (100 + i + 1), // Sample hospital IDs
        hospital_name: `CHC ${district.district_name}`,
        is_active: 1,
        is_password_changed: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      hospitalUsers.push(chcUser);
      console.log(`✅ Created hospital user: ${chcUser.userid} - ${chcUser.name}`);

      // Create PHC (Primary Health Center)
      const phcUser = await User.create({
        userid: `CG-PHC-${district.district_code.toString().padStart(3, '0')}-001`,
        name: `PHC ${district.district_name} Rural - Dr. ${['Patel', 'Kumar', 'Yadav'][i]}`,
        mobile: `999902${(i + 1).toString().padStart(4, '0')}`,
        email: `phc.${district.district_name.toLowerCase().replace(/\s+/g, '')}.001@cg.gov.in`,
        password: hashedPassword,
        role_id: 3, // hospital role
        district_id: district.district_code,
        block_id: null,
        hospital_id: (200 + i + 1), // Sample hospital IDs
        hospital_name: `PHC ${district.district_name} Rural`,
        is_active: 1,
        is_password_changed: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      hospitalUsers.push(phcUser);
      console.log(`✅ Created hospital user: ${phcUser.userid} - ${phcUser.name}`);
    }

    // 4. Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ State users created: 1`);
    console.log(`✅ District users created: ${districtUsers.length}`);
    console.log(`✅ Hospital users created: ${hospitalUsers.length}`);
    console.log(`🎯 Total users created: ${1 + districtUsers.length + hospitalUsers.length}`);

    // 5. Display all created users
    console.log('\n📋 All Created Users:');
    console.log('─'.repeat(80));
    
    // State user
    console.log(`STATE    | ${stateUser.userid.padEnd(15)} | ${stateUser.name.padEnd(35)} | ${stateUser.mobile}`);
    
    // District users
    districtUsers.forEach(user => {
      console.log(`DISTRICT | ${user.userid.padEnd(15)} | ${user.name.padEnd(35)} | ${user.mobile}`);
    });
    
    // Hospital users
    hospitalUsers.forEach(user => {
      console.log(`HOSPITAL | ${user.userid.padEnd(15)} | ${user.name.padEnd(35)} | ${user.mobile}`);
    });
    
    console.log('─'.repeat(80));
    console.log(`\n🔑 Default password for all users: ${defaultPassword}`);
    console.log('\n🎉 User seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedUsers();
