const { 
  Role, 
  District, 
  Block, 
  Village, 
  User, 
  Plant, 
  Child, 
  PlantAssignment 
} = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Seeding initial data...');

    // 1. Create Roles - भूमिकाएं बनाएं
    const roles = await Role.bulkCreate([
      {
        name: 'state',
        description: 'राज्य नोडल अधिकारी - राज्य स्तर की रिपोर्ट्स की पूर्ण पहुंच',
        permissions: ['view_all_reports', 'manage_users', 'manage_plants']
      },
      {
        name: 'collector',
        description: 'जिला कलेक्टर - जिला स्तर की रिपोर्ट्स की पहुंच',
        permissions: ['view_district_reports', 'approve_replacements']
      },
      {
        name: 'hospital',
        description: 'अस्पताल स्टाफ - माताओं को पंजीकृत करें और पौधा आवंटित करें',
        permissions: ['register_mothers', 'assign_plants', 'view_hospital_data']
      },
      {
        name: 'mitanin',
        description: 'मितानिन - पौधों की फोटो अपलोड करें और प्रगति ट्रैक करें',
        permissions: ['upload_photos', 'request_replacement', 'view_assigned_mothers']
      },
      {
        name: 'aww',
        description: 'आंगनवाड़ी कार्यकर्ता - पौधों की फोटो अपलोड करें और प्रगति ट्रैक करें',
        permissions: ['upload_photos', 'request_replacement', 'view_assigned_mothers']
      },
      {
        name: 'mother',
        description: 'माता - यदि मोबाइल है तो पौधों की फोटो अपलोड करें',
        permissions: ['upload_photos', 'view_own_data']
      }
    ], { ignoreDuplicates: true });

    // 2. Create Districts - जिले बनाएं (छत्तीसगढ़ के नमूना जिले)
    const districts = await District.bulkCreate([
      { name: 'रायपुर', code: 'RP', state: 'छत्तीसगढ़' },
      { name: 'बिलासपुर', code: 'BP', state: 'छत्तीसगढ़' },
      { name: 'दुर्ग', code: 'DG', state: 'छत्तीसगढ़' },
      { name: 'कोरबा', code: 'KB', state: 'छत्तीसगढ़' },
      { name: 'रायगढ़', code: 'RG', state: 'छत्तीसगढ़' },
      { name: 'राजनांदगांव', code: 'RN', state: 'छत्तीसगढ़' },
      { name: 'जगदलपुर', code: 'JG', state: 'छत्तीसगढ़' },
      { name: 'अंबिकापुर', code: 'AP', state: 'छत्तीसगढ़' }
    ], { ignoreDuplicates: true });

    // 3. Create Blocks - ब्लॉक बनाएं (रायपुर जिले के नमूना ब्लॉक)
    const blocks = await Block.bulkCreate([
      { name: 'रायपुर', code: 'RP01', district_id: districts[0].id },
      { name: 'अरंग', code: 'RP02', district_id: districts[0].id },
      { name: 'अभनपुर', code: 'RP03', district_id: districts[0].id },
      { name: 'तिल्दा', code: 'RP04', district_id: districts[0].id },
      { name: 'धरसीवा', code: 'RP05', district_id: districts[0].id },
      
      // बिलासपुर ब्लॉक
      { name: 'बिलासपुर', code: 'BP01', district_id: districts[1].id },
      { name: 'तखतपुर', code: 'BP02', district_id: districts[1].id },
      { name: 'मस्तूरी', code: 'BP03', district_id: districts[1].id },
      
      // दुर्ग ब्लॉक
      { name: 'दुर्ग', code: 'DG01', district_id: districts[2].id },
      { name: 'भिलाई', code: 'DG02', district_id: districts[2].id },
      { name: 'पाटन', code: 'DG03', district_id: districts[2].id }
    ], { ignoreDuplicates: true });

    // 4. Create Villages - गांव बनाएं (नमूना गांव)
    const villages = await Village.bulkCreate([
      // रायपुर ब्लॉक के गांव
      { name: 'खरोरा', code: 'RP0101', block_id: blocks[0].id },
      { name: 'सरोना', code: 'RP0102', block_id: blocks[0].id },
      { name: 'तेलीबंधा', code: 'RP0103', block_id: blocks[0].id },
      
      // अरंग ब्लॉक के गांव
      { name: 'अरंग', code: 'RP0201', block_id: blocks[1].id },
      { name: 'केंद्री', code: 'RP0202', block_id: blocks[1].id },
      { name: 'पलौद', code: 'RP0203', block_id: blocks[1].id },
      
      // अभनपुर ब्लॉक के गांव
      { name: 'अभनपुर', code: 'RP0301', block_id: blocks[2].id },
      { name: 'कुम्हारी', code: 'RP0302', block_id: blocks[2].id },
      { name: 'मंदिर हसौद', code: 'RP0303', block_id: blocks[2].id }
    ], { ignoreDuplicates: true });

    // 5. Create Plants - पौधे बनाएं
    const plants = await Plant.bulkCreate([
      {
        name: 'अमरुद',
        species: 'Azadirachta indica',
        category: 'medicinal',
        local_name: 'अमरुद',
        description: 'एंटी-बैक्टीरियल गुणों वाला औषधीय पेड़',
        care_instructions: 'नियमित पानी दें, पूर्ण सूर्य प्रकाश चाहिए',
        growth_period_months: 24
      },
      {
        name: 'तुलसी',
        species: 'Ocimum sanctum',
        category: 'medicinal',
        local_name: 'तुलसी',
        description: 'पवित्र औषधीय पौधा',
        care_instructions: 'रोज पानी दें, आंशिक सूर्य प्रकाश',
        growth_period_months: 6
      },
      {
        name: 'आंवला',
        species: 'Psidium guajava',
        category: 'fruit',
        local_name: 'आंवला',
        description: 'पोषक तत्वों से भरपूर फल का पेड़',
        care_instructions: 'नियमित पानी दें, शाखाओं की छंटाई करें',
        growth_period_months: 36
      },
      {
        name: 'नींबू',
        species: 'Citrus limon',
        category: 'fruit',
        local_name: 'नींबू',
        description: 'विटामिन सी से भरपूर खट्टे फल',
        care_instructions: 'नियमित पानी दें, ठंड से बचाएं',
        growth_period_months: 24
      },
      {
        name: 'गेंदा',
        species: 'Tagetes erecta',
        category: 'flower',
        local_name: 'गेंदा',
        description: 'चमकीले रंग का फूल वाला पौधा',
        care_instructions: 'रोज पानी दें, मुरझाए फूल हटाएं',
        growth_period_months: 4
      },
      {
        name: 'अशोक',
        species: 'Saraca asoca',
        category: 'medicinal',
        local_name: 'अशोक',
        description: 'सुंदर फूलों वाला औषधीय पेड़',
        care_instructions: 'नियमित पानी दें, आंशिक छाया',
        growth_period_months: 36
      },
      {
        name: 'करी पत्ता',
        species: 'Murraya koenigii',
        category: 'medicinal',
        local_name: 'करी पत्ता',
        description: 'खाना पकाने में उपयोग होने वाले सुगंधित पत्ते',
        care_instructions: 'नियमित पानी दें, पूर्ण सूर्य प्रकाश',
        growth_period_months: 18
      },
      {
        name: 'अनार',
        species: 'Punica granatum',
        category: 'fruit',
        local_name: 'अनार',
        description: 'एंटीऑक्सिडेंट से भरपूर फल',
        care_instructions: 'कम पानी दें, पूर्ण सूर्य प्रकाश',
        growth_period_months: 30
      }
    ], { ignoreDuplicates: true });

    // 6. Create Sample Users - नमूना उपयोगकर्ता बनाएं
    const users = await User.bulkCreate([
      {
        userid: 'S001',
        name: 'राज्य नोडल अधिकारी',
        mobile: '9876543210',
        email: 'state@greenpaalna.gov.in',
        password: 'password123',
        role_id: roles[0].id // state
      },
      {
        userid: 'C001',
        name: 'रायपुर कलेक्टर',
        mobile: '9876543211',
        email: 'collector.raipur@greenpaalna.gov.in',
        password: 'password123',
        role_id: roles[1].id, // collector
        district_id: districts[0].id
      },
      {
        userid: 'H001',
        name: 'रायपुर सिविल हॉस्पिटल',
        mobile: '9876543212',
        email: 'hospital.raipur@greenpaalna.gov.in',
        password: 'password123',
        role_id: roles[2].id, // hospital
        district_id: districts[0].id,
        hospital_name: 'डॉ. भीमराव अंबेडकर स्मृति चिकित्सा महाविद्यालय'
      },
      {
        userid: 'M001',
        name: 'सुनीता देवी (मितानिन)',
        mobile: '9876543213',
        password: 'password123',
        role_id: roles[3].id, // mitanin
        district_id: districts[0].id,
        block_id: blocks[0].id
      },
      {
        userid: 'M002',
        name: 'प्रिया शर्मा (मितानिन)',
        mobile: '9876543214',
        password: 'password123',
        role_id: roles[3].id, // mitanin
        district_id: districts[0].id,
        block_id: blocks[1].id
      },
      {
        userid: 'A001',
        name: 'कमला बाई (आंगनवाड़ी)',
        mobile: '9876543215',
        password: 'password123',
        role_id: roles[4].id, // aww
        district_id: districts[0].id,
        block_id: blocks[0].id
      },
      {
        userid: 'MO001',
        name: 'रीता देवी (माता)',
        mobile: '9876543220',
        password: 'password123',
        role_id: roles[5].id, // mother
        district_id: districts[0].id,
        block_id: blocks[0].id
      },
      {
        userid: 'MO002',
        name: 'गीता साहू (माता)',
        mobile: '9876543221',
        password: 'password123',
        role_id: roles[5].id, // mother
        district_id: districts[0].id,
        block_id: blocks[0].id
      }
    ], { ignoreDuplicates: true });

    // 7. Create Sample Children/Mothers - नमूना बच्चे/माताएं बनाएं
    const children = await Child.bulkCreate([
      {
        mother_name: 'रीता देवी',
        mother_mobile: '9876543220',
        mother_aadhar: '123456789012',
        child_name: 'राम',
        dob: new Date('2024-01-15'),
        gender: 'male',
        weight_at_birth: 3.2,
        hospital_id: users[2].id,
        district_id: districts[0].id,
        block_id: blocks[0].id,
        address: 'खरोरा गाँव, रायपुर',
        assigned_mitanin_id: users[3].id
      },
      {
        mother_name: 'गीता साहू',
        mother_mobile: '9876543221',
        child_name: 'सीता',
        dob: new Date('2024-02-10'),
        gender: 'female',
        weight_at_birth: 2.8,
        hospital_id: users[2].id,
        district_id: districts[0].id,
        block_id: blocks[0].id,
        address: 'सरोना गाँव, रायपुर',
        assigned_mitanin_id: users[3].id
      },
      {
        mother_name: 'सुनीता वर्मा',
        mother_mobile: '9876543222',
        child_name: 'अमित',
        dob: new Date('2024-03-05'),
        gender: 'male',
        weight_at_birth: 3.5,
        hospital_id: users[2].id,
        district_id: districts[0].id,
        block_id: blocks[1].id,
        address: 'अरंग गाँव, रायपुर',
        assigned_mitanin_id: users[4].id
      }
    ], { ignoreDuplicates: true });

    // 8. Create Sample Plant Assignments - नमूना पौधे निर्धारण बनाएं
    const plantAssignments = await PlantAssignment.bulkCreate([
      // रीता देवी के पौधे
      {
        child_id: children[0].id,
        plant_id: plants[0].id, // अमरुद
        assigned_by: users[2].id,
        assigned_date: new Date('2024-01-20')
      },
      {
        child_id: children[0].id,
        plant_id: plants[1].id, // तुलसी
        assigned_by: users[2].id,
        assigned_date: new Date('2024-01-20')
      },
      {
        child_id: children[0].id,
        plant_id: plants[2].id, // आंवला
        assigned_by: users[2].id,
        assigned_date: new Date('2024-01-20')
      },
      {
        child_id: children[0].id,
        plant_id: plants[3].id, // नींबू
        assigned_by: users[2].id,
        assigned_date: new Date('2024-01-20')
      },
      {
        child_id: children[0].id,
        plant_id: plants[4].id, // गेंदा
        assigned_by: users[2].id,
        assigned_date: new Date('2024-01-20')
      },

      // गीता साहू के पौधे
      {
        child_id: children[1].id,
        plant_id: plants[0].id, // अमरुद
        assigned_by: users[2].id,
        assigned_date: new Date('2024-02-15')
      },
      {
        child_id: children[1].id,
        plant_id: plants[5].id, // अशोक
        assigned_by: users[2].id,
        assigned_date: new Date('2024-02-15')
      },
      {
        child_id: children[1].id,
        plant_id: plants[6].id, // करी पत्ता
        assigned_by: users[2].id,
        assigned_date: new Date('2024-02-15')
      },
      {
        child_id: children[1].id,
        plant_id: plants[7].id, // अनार
        assigned_by: users[2].id,
        assigned_date: new Date('2024-02-15')
      },
      {
        child_id: children[1].id,
        plant_id: plants[1].id, // तुलसी
        assigned_by: users[2].id,
        assigned_date: new Date('2024-02-15')
      },

      // सुनीता वर्मा के पौधे
      {
        child_id: children[2].id,
        plant_id: plants[2].id, // आंवला
        assigned_by: users[2].id,
        assigned_date: new Date('2024-03-10')
      },
      {
        child_id: children[2].id,
        plant_id: plants[3].id, // नींबू
        assigned_by: users[2].id,
        assigned_date: new Date('2024-03-10')
      },
      {
        child_id: children[2].id,
        plant_id: plants[0].id, // अमरुद
        assigned_by: users[2].id,
        assigned_date: new Date('2024-03-10')
      },
      {
        child_id: children[2].id,
        plant_id: plants[1].id, // तुलसी
        assigned_by: users[2].id,
        assigned_date: new Date('2024-03-10')
      },
      {
        child_id: children[2].id,
        plant_id: plants[4].id, // गेंदा
        assigned_by: users[2].id,
        assigned_date: new Date('2024-03-10')
      }
    ], { ignoreDuplicates: true });

    console.log('✅ बीज डेटा सफलतापूर्वक बनाया गया!');
    console.log(`📊 बनाए गए:`);
    console.log(`   • ${roles.length} भूमिकाएं`);
    console.log(`   • ${districts.length} जिले`);
    console.log(`   • ${blocks.length} ब्लॉक`);
    console.log(`   • ${villages.length} गाँव`);
    console.log(`   • ${users.length} उपयोगकर्ता`);
    console.log(`   • ${plants.length} पौधे`);
    console.log(`   • ${children.length} बच्चे`);
    console.log(`   • ${plantAssignments.length} पौधे निर्धारण`);
    
    console.log('\n🔑 नमूना लॉगिन प्रमाणपत्र:');
    console.log('राज्य अधिकारी: 9876543210 / password123');
    console.log('कलेक्टर: 9876543211 / password123');
    console.log('अस्पताल: 9876543212 / password123');
    console.log('मितानिन 1: 9876543213 / password123');
    console.log('मितानिन 2: 9876543214 / password123');

  } catch (error) {
    console.error('❌ बीज डेटा त्रुटि:', error);
    throw error;
  }
};

module.exports = seedData;
