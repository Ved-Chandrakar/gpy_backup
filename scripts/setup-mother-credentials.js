const db = require('../models');
const bcrypt = require('bcryptjs');

async function setupMotherCredentialsForTesting() {
    try {
        console.log('🔧 Setting up mother credentials for testing...');
        
        // Find mothers (users with role_id = 3)
        const mothers = await db.User.findAll({
            where: { role_id: 3 },
            limit: 3
        });
        
        console.log(`👩 Found ${mothers.length} mother users`);
        
        if (mothers.length > 0) {
            // Set simple passwords for testing
            const testPassword = 'mother123';
            const hashedPassword = await bcrypt.hash(testPassword, 12);
            
            for (const mother of mothers) {
                await db.User.update(
                    { 
                        password: hashedPassword,
                        is_password_changed: true
                    },
                    { where: { id: mother.id } }
                );
                
                console.log(`✅ Updated password for mother: ${mother.name} (ID: ${mother.id}, UserID: ${mother.userid})`);
                console.log(`   📱 Login credentials: ${mother.userid} / ${testPassword}`);
            }
            
            console.log('\n🧪 Testing mother login...');
            
            // Test login with first mother
            const firstMother = mothers[0];
            const axios = require('axios');
            
            try {
                const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
                    userId: firstMother.userid,
                    password: testPassword,
                    loginType: 'mother'
                });
                
                if (loginResponse.data.success) {
                    console.log('✅ Mother login test successful!');
                    const token = loginResponse.data.data.token;
                    
                    // Test mother plant tracking API
                    try {
                        const plantsResponse = await axios.get('http://localhost:3000/api/v1/mother/plants', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (plantsResponse.data.success) {
                            console.log('✅ Mother plant tracking API works!');
                            const plants = plantsResponse.data.data.plants;
                            console.log(`📊 Mother has ${plants.length} plants with tracking schedules`);
                            
                            if (plants.length > 0) {
                                console.log('🌱 First plant tracking info:');
                                console.log(`   Plant: ${plants[0].plant_name}`);
                                console.log(`   Progress: ${plants[0].completed_uploads}/${plants[0].total_uploads_required}`);
                                console.log(`   Next due: ${plants[0].next_due_date}`);
                                console.log(`   Status: ${plants[0].status}`);
                            }
                        }
                    } catch (apiError) {
                        console.log('❌ Mother tracking API failed:', apiError.response?.data?.message || apiError.message);
                    }
                } else {
                    console.log('❌ Mother login failed:', loginResponse.data.message);
                }
            } catch (loginError) {
                console.log('❌ Mother login test failed:', loginError.response?.data?.message || loginError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Setup failed:', error.message);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

setupMotherCredentialsForTesting();
