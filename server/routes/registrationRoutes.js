import { Router } from 'express';
import { body } from 'express-validator';
import {
  createRegistration, myRegistrations, allRegistrations, getRegistration, updateStatus, cancelRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/errorMiddleware.js';

const r = Router();
r.use(protect);
r.post('/', requireRole('student'), [
  body('eventId').notEmpty().withMessage('Event is required'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('phone').matches(/^[0-9+\-\s]{7,15}$/).withMessage('Enter a valid phone number'),
  body('acceptTerms').equals('true').withMessage('You must accept the terms and conditions'),
], validate, createRegistration);
r.get('/my', requireRole('student'), myRegistrations);
r.get('/', requireRole('organizer'), allRegistrations);
r.get('/:id', getRegistration);
r.patch('/:id/status', requireRole('organizer'), updateStatus);
r.patch('/:id/cancel', requireRole('student'), cancelRegistration);
export default r;
