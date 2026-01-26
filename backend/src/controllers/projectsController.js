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

/**
 * GET /api/projects/:id/members
 * Return all members who can be assigned to tasks in this project
 * (members from teams assigned to this project)
 */
export const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const q = `
      SELECT DISTINCT 
        m.member_id,
        m.full_name,
        m.email,
        m.role
      FROM members m
      JOIN team_members tm ON tm.member_id = m.member_id
      JOIN team_projects tp ON tp.team_id = tm.team_id
      WHERE tp.project_id = $1 
        AND tm.is_active = true
        AND m.is_active = true
      ORDER BY m.full_name ASC
    `;
    
    const { rows } = await pool.query(q, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getProjectMembers error', err);
    return res.status(500).json({ error: 'Failed to load project members' });
  }
};

/**
 * POST /api/projects
 * Create a new project (Team Lead or Admin only)
 */
export const createProject = async (req, res) => {
  try {
    const { 
      project_name, 
      description, 
      status = 'Planning', 
      priority = 'Medium',
      start_date,
      end_date,
      total_tasks_target = 42
    } = req.body;
    const userId = req.user.user_id;
    
    if (!project_name || !project_name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    // Create project
    const q = `
      INSERT INTO projects (
        project_name, description, status, priority, 
        start_date, end_date, total_tasks_target, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const { rows } = await pool.query(q, [
      project_name.trim(),
      description?.trim() || null,
      status,
      priority,
      start_date || null,
      end_date || null,
      total_tasks_target,
      userId
    ]);
    
    return res.json(rows[0]);
  } catch (err) {
    console.error('createProject error', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
};