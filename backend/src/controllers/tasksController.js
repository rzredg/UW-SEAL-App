// backend/src/controllers/tasksController.js
import pool from '../config/db.js';

/**
 * GET /api/tasks/my-tasks
 * Get all tasks assigned to the authenticated user
 */
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const q = `
      SELECT 
        t.task_id,
        t.task_name,
        t.description,
        t.status,
        t.priority,
        t.start_date,
        t.due_date,
        t.last_updated,
        t.estimated_hours,
        t.actual_hours,
        t.created_at,
        t.updated_at,
        t.stale_status,
        p.project_id,
        p.project_name,
        ta.assignment_type,
        ta.is_primary
      FROM tasks t
      JOIN task_assignments ta ON ta.task_id = t.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE ta.member_id = $1 AND t.is_active = true
      ORDER BY 
        CASE t.status
          WHEN '1. To Do' THEN 1
          WHEN '2. Doing' THEN 2
          WHEN '3. Review' THEN 3
          WHEN '4. Done (Approved)' THEN 4
          ELSE 5
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;
    
    const { rows } = await pool.query(q, [userId]);
    return res.json(rows);
  } catch (err) {
    console.error('getMyTasks error', err);
    return res.status(500).json({ error: 'Failed to load your tasks' });
  }
};

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const q = `
      SELECT 
        t.*,
        p.project_name,
        p.project_id
      FROM tasks t
      JOIN projects p ON p.project_id = t.project_id
      WHERE t.task_id = $1 AND t.is_active = true
    `;
    
    const { rows } = await pool.query(q, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get assignees
    const assigneesQ = `
      SELECT 
        m.member_id,
        m.full_name,
        m.email,
        ta.assignment_type,
        ta.is_primary
      FROM task_assignments ta
      JOIN members m ON m.member_id = ta.member_id
      WHERE ta.task_id = $1
    `;
    
    const assigneesRes = await pool.query(assigneesQ, [id]);
    
    return res.json({
      ...rows[0],
      assignees: assigneesRes.rows
    });
  } catch (err) {
    console.error('getTask error', err);
    return res.status(500).json({ error: 'Failed to load task' });
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Update task status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.user_id;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['1. To Do', '2. Doing', '3. Review', '4. Done (Approved)', 'Icebox', 'Not Applicable'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get old status for history
    const oldStatusRes = await pool.query(
      'SELECT status FROM tasks WHERE task_id = $1',
      [id]
    );
    
    if (oldStatusRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const oldStatus = oldStatusRes.rows[0].status;
    
    // Update task
    const updateQ = `
      UPDATE tasks 
      SET status = $1, updated_at = CURRENT_TIMESTAMP, last_updated = CURRENT_TIMESTAMP
      WHERE task_id = $2 AND is_active = true
      RETURNING *
    `;
    
    const { rows } = await pool.query(updateQ, [status, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Calculate delta for YBR system
    const statusOrder = {
      '1. To Do': 1,
      '2. Doing': 2,
      '3. Review': 3,
      '4. Done (Approved)': 4,
      'Icebox': 0,
      'Not Applicable': 0
    };
    
    const oldOrder = statusOrder[oldStatus] || 0;
    const newOrder = statusOrder[status] || 0;
    let deltaValue = 0;
    
    if (newOrder > oldOrder) deltaValue = 1;  // Forward progress
    else if (newOrder < oldOrder) deltaValue = -1;  // Backward movement
    
    // Insert into history
    await pool.query(
      `INSERT INTO task_status_history (task_id, old_status, new_status, changed_by, delta_value)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, oldStatus, status, userId, deltaValue]
    );
    
    return res.json(rows[0]);
  } catch (err) {
    console.error('updateTaskStatus error', err);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
};

/**
 * POST /api/tasks/:id/progress
 * Add a progress note to a task
 */
export const addProgressNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.user_id;
    
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Progress note is required' });
    }
    
    const q = `
      INSERT INTO task_progress_log (task_id, member_id, progress_note)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const { rows } = await pool.query(q, [id, userId, note.trim()]);
    
    // Update task last_updated
    await pool.query(
      'UPDATE tasks SET last_updated = CURRENT_TIMESTAMP WHERE task_id = $1',
      [id]
    );
    
    return res.json(rows[0]);
  } catch (err) {
    console.error('addProgressNote error', err);
    return res.status(500).json({ error: 'Failed to add progress note' });
  }
};

/**
 * GET /api/tasks/:id/progress
 * Get all progress notes for a task
 */
export const getProgressNotes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const q = `
      SELECT 
        tpl.*,
        m.full_name,
        m.email
      FROM task_progress_log tpl
      JOIN members m ON m.member_id = tpl.member_id
      WHERE tpl.task_id = $1
      ORDER BY tpl.created_at DESC
    `;
    
    const { rows } = await pool.query(q, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getProgressNotes error', err);
    return res.status(500).json({ error: 'Failed to load progress notes' });
  }
};

/**
 * POST /api/projects/:id/tasks
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { id } = req.params; // Changed from projectId to id
    const userId = req.user.user_id;
    const {
      task_name,
      description,
      instructions,
      priority = 'Medium',
      estimated_hours,
      due_date,
      assignees = []
    } = req.body;
    
    if (!task_name) {
      return res.status(400).json({ error: 'Task name is required' });
    }
    
    // Create task
    const taskQ = `
      INSERT INTO tasks (
        project_id, task_name, description, instructions, priority, 
        estimated_hours, due_date, created_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '1. To Do')
      RETURNING *
    `;
    
    const { rows } = await pool.query(taskQ, [
      id, // Changed from projectId to id
      task_name,
      description,
      instructions,
      priority,
      estimated_hours,
      due_date,
      userId
    ]);
    
    const task = rows[0];
    
    // Assign task to members
    if (assignees.length > 0) {
      for (let i = 0; i < assignees.length; i++) {
        const assignee = assignees[i];
        await pool.query(
          `INSERT INTO task_assignments (task_id, member_id, assignment_type, assigned_by, is_primary)
           VALUES ($1, $2, $3, $4, $5)`,
          [task.task_id, assignee.member_id, assignee.assignment_type || 'assignee', userId, i === 0]
        );
      }
    }
    
    return res.json(task);
  } catch (err) {
    console.error('createTask error', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};