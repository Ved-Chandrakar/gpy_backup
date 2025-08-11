const { Child, District, Block, Village } = require('../models');

const checkChildData = async () => {
  try {
    console.log('👶 Checking child data and relationships...');
    
    // Check total children
    const totalChildren = await Child.count();
    console.log(`📊 Total children in database: ${totalChildren}`);
    
    if (totalChildren === 0) {
      console.log('❌ No children found in database');
      console.log('💡 Need to register some mothers first to test the APIs');
      return;
    }
    
    // Check children registered by our test hospital
    const hospitalChildren = await Child.count({
      where: { hospital_id: 19 } // H001 user ID
    });
    console.log(`🏥 Children registered by hospital H001: ${hospitalChildren}`);
    
    // Get a sample of children with their location data
    console.log('\n📋 Sample children records:');
    const sampleChildren = await Child.findAll({
      limit: 5,
      attributes: ['id', 'mother_name', 'child_name', 'mother_mobile', 'hospital_id', 'district_code', 'block_code', 'village_code'],
      order: [['id', 'DESC']]
    });
    
    if (sampleChildren.length > 0) {
      console.log('┌────┬─────────────────┬─────────────────┬──────────────┬─────────────┬─────────┬─────────┬─────────┐');
      console.log('│ ID │   Mother Name   │   Child Name    │    Mobile    │ Hospital ID │ Dist_ID │ Blk_ID  │ Vil_ID  │');
      console.log('├────┼─────────────────┼─────────────────┼──────────────┼─────────────┼─────────┼─────────┼─────────┤');
      
      sampleChildren.forEach(child => {
        const id = child.id.toString().padEnd(2);
        const motherName = (child.mother_name || 'N/A').padEnd(15).substring(0, 15);
        const childName = (child.child_name || 'N/A').padEnd(15).substring(0, 15);
        const mobile = (child.mother_mobile || 'N/A').padEnd(12);
        const hospitalId = (child.hospital_id || 'N/A').toString().padEnd(11);
        const districtCode = (child.district_code || 'N/A').toString().padEnd(7);
        const blockCode = (child.block_code || 'N/A').toString().padEnd(7);
        const villageCode = (child.village_code || 'N/A').toString().padEnd(7);
        
        console.log(`│ ${id} │ ${motherName} │ ${childName} │ ${mobile} │ ${hospitalId} │ ${districtCode} │ ${blockCode} │ ${villageCode} │`);
      });
      
      console.log('└────┴─────────────────┴─────────────────┴──────────────┴─────────────┴─────────┴─────────┴─────────┘');
    }
    
    // Test the join query directly
    console.log('\n🔍 Testing join query directly...');
    
    try {
      const testChild = await Child.findOne({
        include: [
          {
            model: District,
            as: 'district',
            attributes: ['district_code', 'district_name']
          },
          {
            model: Block,
            as: 'block',
            attributes: ['block_code', 'block_name']
          },
          {
            model: Village,
            as: 'village',
            attributes: ['village_code', 'village_name', 'village_lgd_code']
          }
        ],
        attributes: ['id', 'mother_name', 'child_name'],
        limit: 1
      });
      
      if (testChild) {
        console.log('✅ Join query successful');
        console.log(`   Child: ${testChild.child_name}`);
        console.log(`   District: ${testChild.district?.district_name || 'No district'}`);
        console.log(`   Block: ${testChild.block?.block_name || 'No block'}`);
        console.log(`   Village: ${testChild.village?.village_name || 'No village'}`);
      } else {
        console.log('❌ No children found with join query');
      }
      
    } catch (joinError) {
      console.error('❌ Join query failed:', joinError.message);
    }

  } catch (error) {
    console.error('❌ Error checking child data:', error.message);
  }
};

checkChildData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
