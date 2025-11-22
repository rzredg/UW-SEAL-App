// backend/src/routes/teams.js
import express from 'express';
import {
  listTeams,
  getTeam,
  getTeamMembers,
  getTeamProjects,
  joinTeam
} from '../controllers/teamsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listTeams);                 // GET /api/teams
router.get('/:id', getTeam);                // GET /api/teams/:id
router.get('/:id/members', getTeamMembers); // GET /api/teams/:id/members
router.get('/:id/projects', getTeamProjects); // GET /api/teams/:id/projects

// authenticated endpoint
router.post('/:id/join', protect, joinTeam);

export default router;
