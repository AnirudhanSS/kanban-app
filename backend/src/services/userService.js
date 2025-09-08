// backend/src/services/userService.js
const { User } = require('../db/associations');

async function softDeleteUser(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.is_deleted = true;
  user.is_active = false; // optional: lock them out
  await user.save();

  return user;
}

module.exports = { softDeleteUser };
