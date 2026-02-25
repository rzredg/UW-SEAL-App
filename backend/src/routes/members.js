// backend/src/routes/members.js
import express from 'express';
import { 
    getAllMembers, 
    getMember, 
    getMemberStats, 
    getAdminMemberOverview, 
    updateHealthPoints,
    updateGoldMedals,
    updateMemberRole,
    deleteMember
} from '../controllers/membersController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Admin-only route
router.get('/admin/overview', protect, requireRole('Admin'), getAdminMemberOverview);

// General routes
router.get('/', getAllMembers); // GET /api/members
router.get('/:id', getMember);  // GET /api/members/:id
router.get('/:id/stats', protect, getMemberStats);

// Admin-only updates
router.patch('/:id/health-points', protect, requireRole('Admin'), updateHealthPoints);
router.patch('/:id/gold-medals', protect, requireRole('Admin'), updateGoldMedals);
router.patch('/:id/role', protect, requireRole('Admin'), updateMemberRole);
router.delete('/:id', protect, requireRole('Admin'), deleteMember);

export default router;