const { sequelize } = require('../config/database');

async function migrateUserid() {
  try {
    console.log('🚀 Starting userid migration...');
    
    // Add the userid column to the User table
    await sequelize.query(`
      ALTER TABLE tbl_user 
      ADD COLUMN userid VARCHAR(50) NOT NULL DEFAULT '' AFTER id
    `);
    
    console.log('✅ Added userid column to tbl_user table');
    
    // Update existing users to generate userids based on their roles and IDs
    
    // Get all users with their roles
    const users = await sequelize.query(`
      SELECT u.id, u.role_id, r.name as role_name 
      FROM tbl_user u 
      JOIN master_role r ON u.role_id = r.id
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`📊 Found ${users.length} users to update`);
    
    // Update users with appropriate userids
    for (const user of users) {
      let prefix = '';
      switch (user.role_name) {
        case 'hospital':
          prefix = 'H';
          break;
        case 'mitanin':
          prefix = 'M';
          break;
        case 'aww':
          prefix = 'A';
          break;
        case 'mother':
          prefix = 'MO';
          break;
        case 'state':
          prefix = 'S';
          break;
        case 'collector':
          prefix = 'C';
          break;
        default:
          prefix = 'U';
      }
      
      const userid = prefix + user.id.toString().padStart(3, '0');
      
      await sequelize.query(`
        UPDATE tbl_user 
        SET userid = :userid 
        WHERE id = :id
      `, {
        replacements: { userid, id: user.id },
        type: sequelize.QueryTypes.UPDATE
      });
      
      console.log(`✅ Updated user ID ${user.id} (${user.role_name}) with userid: ${userid}`);
    }
    
    // Make the userid column unique
    await sequelize.query(`
      ALTER TABLE tbl_user 
      ADD UNIQUE INDEX unique_userid (userid)
    `);
    
    console.log('✅ Added unique constraint to userid column');
    
    // Show the updated users
    const updatedUsers = await sequelize.query(`
      SELECT id, userid, name, mobile, role_id 
      FROM tbl_user 
      ORDER BY id
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Updated users:');
    console.table(updatedUsers);
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // If the error is that the column already exists, that's okay
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ userid column already exists, skipping column creation');
      console.log('🎉 Migration completed successfully!');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// Run the migration
migrateUserid().catch(console.error);
