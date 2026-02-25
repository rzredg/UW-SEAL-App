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
        m.health_points,
        m.gold_medals,
        STRING_AGG(DISTINCT t.team_name, ', ' ORDER BY t.team_name) AS teams
      FROM members m
      LEFT JOIN team_members tm ON tm.member_id = m.member_id AND tm.is_active = true
      LEFT JOIN teams t ON t.team_id = tm.team_id
      WHERE m.is_active = true
      GROUP BY m.member_id, m.full_name, m.role, m.email, m.student_id, m.major, 
        m.year_level, m.created_at, m.health_points, m.gold_medals
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

/**
 * GET /api/members/:id/stats
 * Get task statistics for a specific member
 */
export const getMemberStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get task counts by status
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE t.status = '4. Done (Approved)') as completed_tasks,
        COUNT(*) FILTER (WHERE t.status IN ('1. To Do', '2. Doing', '3. Review')) as ongoing_tasks,
        COUNT(*) FILTER (WHERE t.stale_status IN ('IGNORE', 'STALE', 'ABANDONED')) as stale_tasks,
        COUNT(*) as total_tasks
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      WHERE ta.member_id = $1 AND t.is_active = true
    `;
    
    const statsResult = await pool.query(statsQuery, [id]);
    
    return res.json(statsResult.rows[0]);
  } catch (err) {
    console.error('getMemberStats error', err);
    return res.status(500).json({ error: 'Failed to load member stats' });
  }
};

/**
 * GET /api/members/admin/overview
 * Get all members with their task statistics (Admin only)
 */
export const getAdminMemberOverview = async (req, res) => {
  try {
    const query = `
      SELECT 
        m.member_id,
        m.full_name,
        m.email,
        m.role,
        m.health_points,
        m.gold_medals,
        STRING_AGG(DISTINCT t.team_name, ', ' ORDER BY t.team_name) AS teams,
        COUNT(DISTINCT ta.task_id) FILTER (WHERE tasks.status = '4. Done (Approved)') as completed_tasks,
        COUNT(DISTINCT ta.task_id) FILTER (WHERE tasks.status IN ('1. To Do', '2. Doing', '3. Review')) as ongoing_tasks,
        COUNT(DISTINCT ta.task_id) FILTER (WHERE tasks.stale_status IN ('IGNORE', 'STALE', 'ABANDONED')) as stale_tasks,
        COUNT(DISTINCT ta.task_id) as total_tasks
      FROM members m
      LEFT JOIN team_members tm ON tm.member_id = m.member_id AND tm.is_active = true
      LEFT JOIN teams t ON t.team_id = tm.team_id
      LEFT JOIN task_assignments ta ON ta.member_id = m.member_id
      LEFT JOIN tasks ON tasks.task_id = ta.task_id AND tasks.is_active = true
      WHERE m.is_active = true
      GROUP BY m.member_id, m.full_name, m.email, m.role, m.health_points, m.gold_medals
      ORDER BY m.full_name ASC
    `;
    
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (err) {
    console.error('getAdminMemberOverview error', err);
    return res.status(500).json({ error: 'Failed to load admin overview' });
  }
};

/**
 * PATCH /api/members/:id/health-points
 * Update member's health points (Admin only)
 */
export const updateHealthPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { health_points, reason } = req.body;
    
    if (health_points < 0 || health_points > 5) {
      return res.status(400).json({ error: 'Health points must be between 0 and 5' });
    }
    
    const updateResult = await pool.query(
      'UPDATE members SET health_points = $1 WHERE member_id = $2 RETURNING *',
      [health_points, id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    return res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('updateHealthPoints error', err);
    return res.status(500).json({ error: 'Failed to update health points' });
  }
};

/**
 * PATCH /api/members/:id/gold-medals
 * Update member's gold medals (Admin only)
 */
export const updateGoldMedals = async (req, res) => {
  try {
    const { id } = req.params;
    const { gold_medals, reason } = req.body;
    
    if (gold_medals < 0) {
      return res.status(400).json({ error: 'Gold medals cannot be negative' });
    }
    
    const updateResult = await pool.query(
      'UPDATE members SET gold_medals = $1 WHERE member_id = $2 RETURNING *',
      [gold_medals, id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    return res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('updateGoldMedals error', err);
    return res.status(500).json({ error: 'Failed to update gold medals' });
  }
};

/**
 * PATCH /api/members/:id/role
 * Update member's role (Admin only)
 */
export const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['Associate', 'Team Lead', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const updateResult = await pool.query(
      'UPDATE members SET role = $1 WHERE member_id = $2 RETURNING *',
      [role, id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    return res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('updateMemberRole error', err);
    return res.status(500).json({ error: 'Failed to update member role' });
  }
};

/**
 * DELETE /api/members/:id
 * Deactivate a member (Admin only)
 */
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete - set is_active to false instead of actually deleting
    const updateResult = await pool.query(
      'UPDATE members SET is_active = false WHERE member_id = $1 RETURNING *',
      [id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Also deactivate their team memberships
    await pool.query(
      'UPDATE team_members SET is_active = false, left_at = CURRENT_TIMESTAMP WHERE member_id = $1',
      [id]
    );
    
    return res.json({ 
      success: true, 
      message: 'Member deactivated successfully',
      member: updateResult.rows[0]
    });
  } catch (err) {
    console.error('deleteMember error', err);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
};