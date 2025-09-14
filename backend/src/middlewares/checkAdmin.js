// src/middlewares/checkAdmin.js
const { BoardMember } = require('../db/associations');

async function checkAdmin(req, res, next) {
  try {
    const user = req.user; // set by authMiddleware
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    console.log('checkAdmin: Checking permissions for user:', user.id, user.email);

    // Check if user is an owner/admin in any board
    const membership = await BoardMember.findOne({
      where: { user_id: user.id, role: ['owner','admin'] },
    });

    console.log('checkAdmin: Found membership:', membership ? membership.role : 'none');

    // For now, allow any authenticated user to access admin panel for testing
    // TODO: Remove this in production and enforce proper admin roles
    if (!membership) {
      console.log('checkAdmin: No admin membership found, but allowing access for testing');
      req.adminRole = 'viewer'; // temporary role for testing
      return next();
    }

    req.adminRole = membership.role;
    next();
  } catch (err) {
    console.error('checkAdmin error:', err);
    next(err);
  }
}

module.exports = checkAdmin;
