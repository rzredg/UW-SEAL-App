// backend/src/routes/projects.js
import express from 'express';
import { listProjects, getProject, getProjectTasks, getProjectMembers, createProject } from '../controllers/projectsController.js';
import { createTask } from '../controllers/tasksController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', listProjects); // GET /api/projects
router.get('/:id', getProject); // GET /api/projects/:id
router.get('/:id/tasks', getProjectTasks); // GET /api/projects/:id/tasks
router.get('/:id/members', getProjectMembers); // GET /api/projects/:id/members
router.post('/:id/tasks', protect, createTask); // POST /api/projects/:id/tasks
router.post('/', protect, requireRole(['Team Lead', 'Admin']), createProject); // Team Lead or Admin only

export default router;