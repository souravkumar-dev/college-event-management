import { Router } from 'express';
import { body } from 'express-validator';
import { listEvents, getEvent, myEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/errorMiddleware.js';
import { CATEGORIES } from '../models/Event.js';

const eventRules = (optional = false) => [
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('category').isIn(CATEGORIES).withMessage('Select a valid category'),
  body('eventType').trim().notEmpty().withMessage('Event type is required'),
  body('date').isISO8601().withMessage('Select a valid date'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('image').trim().notEmpty().withMessage('Event image is required'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('registrationDeadline').isISO8601().withMessage('Select a valid registration deadline'),
  body('highlights').optional().isArray().withMessage('Highlights must be a list'),
  body('gallery').optional().isArray().withMessage('Gallery must be a list'),
].map((rule) => (optional ? rule.optional() : rule));

const r = Router();
r.get('/', listEvents);
r.get('/organizer/my-events', protect, requireRole('organizer'), myEvents);
r.get('/:id', getEvent);
r.post('/', protect, requireRole('organizer'), eventRules(), validate, createEvent);
r.put('/:id', protect, requireRole('organizer'), eventRules(true), validate, updateEvent);
r.delete('/:id', protect, requireRole('organizer'), deleteEvent);
export default r;
