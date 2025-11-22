// backend/src/controllers/teamsController.js
import pool from '../config/db.js';

/**
 * GET /api/teams
 * Return list of teams with member count
 */
export const listTeams = async (req, res) => {
  try {
    const q = `
      SELECT t.team_id, t.team_name, t.description,
             COUNT(tm.team_member_id) FILTER (WHERE tm.is_active = true) AS member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.team_id
      GROUP BY t.team_id
      ORDER BY t.team_name ASC
    `;
    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    console.error('listTeams error', err);
    return res.status(500).json({ error: 'Failed to load teams' });
  }
};

/**
 * GET /api/teams/:id
 * Return the team object
 */
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const q = `SELECT team_id, team_name, description, team_leader_id, created_at, updated_at, is_active FROM teams WHERE team_id = $1`;
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getTeam error', err);
    return res.status(500).json({ error: 'Failed to load team' });
  }
};

/**
 * GET /api/teams/:id/members
 * Return array of members for the team
 */
export const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT m.member_id, m.full_name, m.email, m.role, m.profile_picture_url
      FROM team_members tm
      JOIN members m ON m.member_id = tm.member_id
      WHERE tm.team_id = $1 AND tm.is_active = true
      ORDER BY m.full_name
    `;
    const { rows } = await pool.query(q, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getTeamMembers error', err);
    return res.status(500).json({ error: 'Failed to load members' });
  }
};

/**
 * GET /api/teams/:id/projects
 * Return projects assigned to this team
 */
export const getTeamProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT p.project_id, p.project_name, p.description, p.status, p.priority
      FROM team_projects tp
      JOIN projects p ON p.project_id = tp.project_id
      WHERE tp.team_id = $1
      ORDER BY p.project_name
    `;
    const { rows } = await pool.query(q, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getTeamProjects error', err);
    return res.status(500).json({ error: 'Failed to load projects for team' });
  }
};

/**
 * POST /api/teams/:id/join
 * Add the authenticated user to the team_members table.
 * If already a member, return 200 and do nothing.
 */
export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    // middleware.auth should populate req.user.user_id
    const userId = req.user?.user_id || req.user?.member_id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if team exists
    const teamRes = await pool.query('SELECT team_id FROM teams WHERE team_id = $1', [id]);
    if (teamRes.rows.length === 0) return res.status(404).json({ error: 'Team not found' });

    // Check existing active membership
    const existing = await pool.query(
      `SELECT team_member_id, is_active FROM team_members WHERE team_id = $1 AND member_id = $2`,
      [id, userId]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.is_active) {
        return res.json({ success: true, message: 'Already a member' });
      } else {
        // reactivate membership: set is_active = true, clear left_at
        await pool.query(
          `UPDATE team_members SET is_active = true, left_at = NULL WHERE team_member_id = $1`,
          [row.team_member_id]
        );
        return res.json({ success: true, message: 'Re-joined team' });
      }
    }

    // Insert new membership
    await pool.query(
      `INSERT INTO team_members (team_id, member_id, joined_at, is_active) VALUES ($1, $2, CURRENT_TIMESTAMP, true)`,
      [id, userId]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('joinTeam error', err);
    return res.status(500).json({ error: 'Failed to join team' });
  }
};
