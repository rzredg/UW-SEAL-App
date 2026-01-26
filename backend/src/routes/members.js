// backend/src/routes/members.js
import express from 'express';
import { getAllMembers, getMember } from '../controllers/membersController.js';

const router = express.Router();

router.get('/', getAllMembers); // GET /api/members
router.get('/:id', getMember);  // GET /api/members/:id

export default router;