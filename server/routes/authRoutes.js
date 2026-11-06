import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, me, updateMe, forgotPassword, resetPassword, googleLogin, getSaved, saveEvent, unsaveEvent } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorMiddleware.js';

const r = Router();
r.post('/register', [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('phone').matches(/^[0-9+\-\s]{7,15}$/).withMessage('Enter a valid phone number'),
], validate, register);
r.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);
r.post('/logout', logout);
r.get('/me', protect, me);
r.put('/me', protect, updateMe);
r.post('/forgot-password', [body('email').isEmail().withMessage('Enter a valid email address')], validate, forgotPassword);
r.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, resetPassword);
r.post('/google', [body('credential').notEmpty().withMessage('Google credential is required')], validate, googleLogin);
r.get('/saved', protect, getSaved);
r.post('/saved/:eventId', protect, saveEvent);
r.delete('/saved/:eventId', protect, unsaveEvent);
export default r;
