// backend/src/routes/tasks.js
import express from 'express';
import {
  getMyTasks,
  getTask,
  updateTaskStatus,
  addProgressNote,
  getProgressNotes
} from '../controllers/tasksController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.get('/my-tasks', protect, getMyTasks);
router.get('/:id', protect, getTask);
router.patch('/:id/status', protect, updateTaskStatus);
router.post('/:id/progress', protect, addProgressNote);
router.get('/:id/progress', protect, getProgressNotes);

export default router;