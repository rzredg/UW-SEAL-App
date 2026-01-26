// backend/src/middleware/roleCheck.js
import pool from '../config/db.js';

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Role or array of roles allowed
 */
export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      
      // Get user's role from database
      const result = await pool.query(
        'SELECT role FROM members WHERE member_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userRole = result.rows[0].role;
      
      // Check if user has required role
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          current: userRole
        });
      }
      
      // Add role to request object for use in controllers
      req.userRole = userRole;
      next();
    } catch (err) {
      console.error('Role check error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
};