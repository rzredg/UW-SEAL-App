// backend/src/routes/projects.js
import express from 'express';
import { listProjects, getProject, getProjectTasks } from '../controllers/projectsController.js';

const router = express.Router();

router.get('/', listProjects); // GET /api/projects
router.get('/:id', getProject); // GET /api/projects/:id
router.get('/:id/tasks', getProjectTasks); // GET /api/projects/:id/tasks

export default router;
