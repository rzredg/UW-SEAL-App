// backend/src/controllers/membersController.js
import pool from '../config/db.js';

/**
 * GET /api/members
 * Return all active members with their team information
 */
export const getAllMembers = async (req, res) => {
  try {
    const q = `
      SELECT 
        m.member_id,
        m.full_name,
        m.role,
        m.email,
        m.student_id,
        m.major,
        m.year_level,
        m.created_at,
        STRING_AGG(DISTINCT t.team_name, ', ' ORDER BY t.team_name) AS teams
      FROM members m
      LEFT JOIN team_members tm ON tm.member_id = m.member_id AND tm.is_active = true
      LEFT JOIN teams t ON t.team_id = tm.team_id
      WHERE m.is_active = true
      GROUP BY m.member_id, m.full_name, m.role, m.email, m.student_id, m.major, m.year_level, m.created_at
      ORDER BY m.full_name ASC
    `;
    
    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    console.error('getAllMembers error', err);
    return res.status(500).json({ error: 'Failed to load members' });
  }
};

/**
 * GET /api/members/:id
 * Get a single member's detailed information
 */
export const getMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const memberQ = `
      SELECT 
        m.*,
        STRING_AGG(DISTINCT t.team_name, ', ' ORDER BY t.team_name) AS teams
      FROM members m
      LEFT JOIN team_members tm ON tm.member_id = m.member_id AND tm.is_active = true
      LEFT JOIN teams t ON t.team_id = tm.team_id
      WHERE m.member_id = $1 AND m.is_active = true
      GROUP BY m.member_id
    `;
    
    const { rows } = await pool.query(memberQ, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    return res.json(rows[0]);
  } catch (err) {
    console.error('getMember error', err);
    return res.status(500).json({ error: 'Failed to load member' });
  }
};