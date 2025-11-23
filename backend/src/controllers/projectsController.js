// backend/src/controllers/projectsController.js
import pool from '../config/db.js';

/**
 * GET /api/projects
 * Return list of projects
 */
export const listProjects = async (req, res) => {
  try {
    const q = `
      SELECT project_id, project_name, description, status, priority, start_date, end_date
      FROM projects
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    console.error('listProjects error', err);
    return res.status(500).json({ error: 'Failed to load projects' });
  }
};

/**
 * GET /api/projects/:id
 * Return single project details
 */
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT project_id, project_name, description, status, priority, start_date, end_date, created_by, created_at, updated_at
      FROM projects
      WHERE project_id = $1 AND is_active = true
    `;
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getProject error', err);
    return res.status(500).json({ error: 'Failed to load project' });
  }
};

/**
 * GET /api/projects/:id/tasks
 * Return tasks for a given project with primary assignee
 */
export const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT 
        t.task_id, 
        t.task_name, 
        t.description, 
        t.status, 
        t.priority, 
        t.start_date, 
        t.due_date,
        ta.member_id AS assigned_member_id,
        m.full_name AS assigned_member_name
      FROM tasks t
      LEFT JOIN task_assignments ta ON ta.task_id = t.task_id AND ta.is_primary = true
      LEFT JOIN members m ON m.member_id = ta.member_id
      WHERE t.project_id = $1 AND t.is_active = true
      ORDER BY t.created_at ASC
    `;
    const { rows } = await pool.query(q, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getProjectTasks error', err);
    return res.status(500).json({ error: 'Failed to load tasks for project' });
  }
};