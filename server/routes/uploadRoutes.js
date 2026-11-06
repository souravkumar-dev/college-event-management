import { Router } from 'express';
import { uploadEventImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const r = Router();
r.post('/event-image', protect, requireRole('organizer'), upload.single('image'), uploadEventImage);
export default r;
