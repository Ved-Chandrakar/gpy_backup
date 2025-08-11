const axios = require('axios');

async function debugAuthenticatedUser() {
    try {
        console.log('🔍 Debugging authenticated user object...');
        
        // Login to get token
        const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
            userId: 'M9876543210',
            password: 'mother123',
            loginType: 'mother'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }
        
        console.log('✅ Login successful');
        console.log('👤 User object from login:', JSON.stringify(loginResponse.data.data.user, null, 2));
        
        // Check what user info is in the token
        const jwt = require('jsonwebtoken');
        const token = loginResponse.data.data.token;
        
        try {
            const decoded = jwt.decode(token);
            console.log('\n🔑 Decoded token payload:', JSON.stringify(decoded, null, 2));
        } catch (decodeError) {
            console.log('❌ Token decode failed:', decodeError.message);
        }
        
        // Now let's check what the user object looks like in the database
        const db = require('../models');
        const user = await db.User.findOne({ 
            where: { userid: 'M9876543210' },
            raw: true 
        });
        console.log('\n💾 User from database:', JSON.stringify(user, null, 2));
        
        // Check child records for this mobile
        const mobile = user.mobile;
        console.log(`\n👶 Looking for child with mother_mobile: ${mobile}`);
        
        const children = await db.Child.findAll({ 
            where: { mother_mobile: mobile },
            raw: true 
        });
        
        if (children.length > 0) {
            console.log('✅ Found children:', children.length);
            children.forEach((child, i) => {
                console.log(`  ${i + 1}. Child ID: ${child.id}, Mother: ${child.mother_name}, Mobile: ${child.mother_mobile}`);
            });
        } else {
            console.log('❌ No children found with this mobile');
            
            // Check all children to see what mobiles exist
            const allChildren = await db.Child.findAll({ limit: 5, raw: true });
            console.log('\nAvailable children:');
            allChildren.forEach((child, i) => {
                console.log(`  ${i + 1}. Mother Mobile: ${child.mother_mobile}, Name: ${child.mother_name}`);
            });
        }
        
        await db.sequelize.close();
        
    } catch (error) {
        console.log('❌ Debug failed:', error.message);
    }
}

debugAuthenticatedUser();
