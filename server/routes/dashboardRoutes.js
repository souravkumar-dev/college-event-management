import { Router } from 'express';
import { studentStats, organizerStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const r = Router();
r.get('/student', protect, requireRole('student'), studentStats);
r.get('/organizer', protect, requireRole('organizer'), organizerStats);
export default r;
