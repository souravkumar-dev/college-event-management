import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import { OAuth2Client } from 'google-auth-library';
import { sendMail } from '../utils/mailer.js';
import Event from '../models/Event.js';

const authResponse = (user) => ({ token: signToken(user), user });

// POST /api/auth/register  (public sign-up is always a student)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, department, academicYear, phone } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name, email, password, rollNumber, department, academicYear, phone, role: 'student' });
  res.status(201).json(authResponse(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  res.json(authResponse(user));
});

// POST /api/auth/logout  (JWT is stateless; the client deletes its token)
export const logout = (_req, res) => res.json({ message: 'Logged out' });

// GET /api/auth/me
export const me = (req, res) => res.json({ user: req.user });

// PUT /api/auth/me  (profile update; role and email cannot be changed here)
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'rollNumber', 'department', 'academicYear', 'phone'];
  allowed.forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  if (req.body.password) {
    if (req.body.password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
    req.user.password = req.body.password;
  }
  await req.user.save();
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  const response = { message: 'If the email exists, a reset link has been generated.' };
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${raw}`;
    const sent = await sendMail({
      to: user.email,
      subject: 'Reset your College Event Management password',
      html: `<p>Hello ${user.name},</p><p>Click the link below to set a new password. It expires in 30 minutes.</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }).catch((e) => { console.error(e); return false; });
    if (!sent) {
      // Email not configured or failed: log the link (and return it outside production) for testing
      console.log('Password reset link:', link);
      if (process.env.NODE_ENV !== 'production') response.resetLink = link;
    }
  }
  res.json(response);
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token || '').digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } })
    .select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated. You can now log in.' });
});

// POST /api/auth/google  { credential } — Google Identity Services ID token. New users become students.
export const googleLogin = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new ApiError(501, 'Google sign-in is not configured');
  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: req.body.credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Google sign-in failed');
  }
  if (!payload?.email || !payload.email_verified) throw new ApiError(401, 'Google account email is not verified');
  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      password: crypto.randomBytes(24).toString('hex'),
      googleId: payload.sub,
      role: 'student',
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }
  res.json(authResponse(user));
});

// GET /api/auth/saved  — events the user saved for later
export const getSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedEvents');
  res.json({ items: (user.savedEvents || []).filter(Boolean) });
});

// POST /api/auth/saved/:eventId  and  DELETE /api/auth/saved/:eventId
export const saveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { savedEvents: event._id } });
  res.json({ saved: true });
});

export const unsaveEvent = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { savedEvents: req.params.eventId } });
  res.json({ saved: false });
});
