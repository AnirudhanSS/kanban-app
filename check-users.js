// Quick script to check current user verification status
require('dotenv').config();
const sequelize = require('./src/db/db');

async function checkUsers() {
  try {
    console.log('👥 Current User Verification Status:\n');

    // 1. Get all users with verification status
    const users = await sequelize.query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        is_email_verified,
        email_confirmed_at,
        created_at,
        is_active
      FROM users 
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('📋 All Users:');
    console.table(users);

    // 2. Get verification statistics
    const stats = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN is_email_verified = false THEN 1 END) as unverified_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
      FROM users 
      WHERE is_deleted = false
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📊 User Statistics:');
    console.table(stats);

    // 3. Show unverified users
    const unverified = await sequelize.query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        created_at
      FROM users 
      WHERE is_deleted = false 
        AND is_email_verified = false
      ORDER BY created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n❌ Unverified Users:');
    if (unverified.length > 0) {
      console.table(unverified);
    } else {
      console.log('All users are verified! ✅');
    }

    console.log('\n🔧 To manually verify users, use these SQL commands:');
    console.log('1. Verify all users: UPDATE users SET is_email_verified = true, email_confirmed_at = NOW() WHERE is_deleted = false;');
    console.log('2. Verify specific user: UPDATE users SET is_email_verified = true, email_confirmed_at = NOW() WHERE email = \'user@example.com\';');
    console.log('3. Check the user-verification-queries.sql file for more options');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
