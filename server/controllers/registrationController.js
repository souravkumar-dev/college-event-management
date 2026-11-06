import mongoose from 'mongoose';
import Event, { computeStatus, deadlinePassed, startOfToday } from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Atomically take one seat. Returns the updated event, or null if no seat/closed.
const reserveSeat = (eventId) => Event.findOneAndUpdate(
  {
    _id: eventId,
    published: true,
    status: { $ne: 'Cancelled' },
    registrationDeadline: { $gte: startOfToday() },
    $expr: { $lt: ['$activeRegistrations', '$maxParticipants'] },
  },
  { $inc: { activeRegistrations: 1 } },
  { new: true }
);

const releaseSeat = (eventId) => Event.updateOne(
  { _id: eventId, activeRegistrations: { $gt: 0 } },
  { $inc: { activeRegistrations: -1 } }
);

// POST /api/registrations  (student)
export const createRegistration = asyncHandler(async (req, res) => {
  const { eventId, fullName, rollNumber, department, academicYear, email, phone, additionalDetails } = req.body;
  if (!mongoose.isValidObjectId(eventId)) throw new ApiError(404, 'Event not found');

  const event = await Event.findById(eventId);
  if (!event || !event.published) throw new ApiError(404, 'Event not found');
  const status = computeStatus(event);
  if (status === 'Cancelled') throw new ApiError(400, 'This event has been cancelled');
  if (status === 'Completed') throw new ApiError(400, 'This event has already finished');
  if (deadlinePassed(event.registrationDeadline)) throw new ApiError(400, 'Registration deadline has passed');

  const existing = await Registration.findOne({ studentId: req.user._id, eventId });
  if (existing && existing.status !== 'cancelled') throw new ApiError(409, 'You are already registered for this event');

  const reserved = await reserveSeat(eventId);
  if (!reserved) throw new ApiError(400, 'Registration is closed or the event is full');

  const details = { fullName, rollNumber, department, academicYear, email, phone, additionalDetails };
  try {
    let registration;
    if (existing) {
      // Re-register after a cancellation: reuse the same document (unique index on student + event)
      Object.assign(existing, details, { status: 'pending', registrationDate: new Date() });
      registration = await existing.save();
    } else {
      registration = await Registration.create({ ...details, studentId: req.user._id, eventId });
    }
    // Keep the student's profile filled for next time
    await User.updateOne({ _id: req.user._id }, { rollNumber, department, academicYear, phone });
    res.status(201).json(registration);
  } catch (err) {
    await releaseSeat(eventId);
    if (err.code === 11000) throw new ApiError(409, 'You are already registered for this event');
    throw err;
  }
});

// GET /api/registrations/my  (student)
export const myRegistrations = asyncHandler(async (req, res) => {
  const filter = { studentId: req.user._id };
  if (['pending', 'confirmed', 'cancelled'].includes(req.query.status)) filter.status = req.query.status;
  let items = await Registration.find(filter).populate('eventId').sort({ registrationDate: -1 });
  items = items.filter((r) => r.eventId);
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter((r) => r.eventId.eventName.toLowerCase().includes(q));
  }
  res.json({ items });
});

// GET /api/registrations  (organizer: registrations for their own events)
export const allRegistrations = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const ownEventIds = (await Event.find({ createdBy: req.user._id }).select('_id')).map((e) => e._id);

  const filter = { eventId: { $in: ownEventIds } };
  if (req.query.eventId && mongoose.isValidObjectId(req.query.eventId)) {
    filter.eventId = ownEventIds.some((id) => String(id) === req.query.eventId) ? req.query.eventId : null;
  }
  if (['pending', 'confirmed', 'cancelled'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.registrationDate = {};
    if (req.query.from) filter.registrationDate.$gte = new Date(req.query.from);
    if (req.query.to) { const t = new Date(req.query.to); t.setHours(23, 59, 59, 999); filter.registrationDate.$lte = t; }
  }
  if (req.query.search) {
    const rx = { $regex: escapeRegex(req.query.search), $options: 'i' };
    const matchingEvents = await Event.find({ _id: { $in: ownEventIds }, eventName: rx }).select('_id');
    filter.$or = [{ fullName: rx }, { email: rx }, { rollNumber: rx }, { eventId: { $in: matchingEvents.map((e) => e._id) } }];
  }

  const [items, total, counts] = await Promise.all([
    Registration.find(filter).populate('eventId').sort({ registrationDate: -1 }).skip((page - 1) * limit).limit(limit),
    Registration.countDocuments(filter),
    Registration.aggregate([{ $match: { eventId: { $in: ownEventIds } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const summary = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
  counts.forEach((c) => { summary[c._id] = c.n; summary.total += c.n; });
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1, summary });
});

// GET /api/registrations/:id  (owner student or the event's organizer)
export const getRegistration = asyncHandler(async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('eventId').populate('studentId', 'name email');
  if (!reg || !reg.eventId) throw new ApiError(404, 'Registration not found');
  const isOwner = String(reg.studentId._id) === String(req.user._id);
  const isOrganizer = req.user.role === 'organizer' && String(reg.eventId.createdBy) === String(req.user._id);
  if (!isOwner && !isOrganizer) throw new ApiError(403, 'Not allowed');
  res.json(reg);
});

// PATCH /api/registrations/:id/status  (organizer)
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) throw new ApiError(400, 'Invalid status');
  const reg = await Registration.findById(req.params.id).populate('eventId');
  if (!reg || !reg.eventId) throw new ApiError(404, 'Registration not found');
  if (String(reg.eventId.createdBy) !== String(req.user._id)) throw new ApiError(403, 'Not your event');

  const wasActive = reg.status !== 'cancelled';
  const willBeActive = status !== 'cancelled';
  if (!wasActive && willBeActive) {
    // Re-activating needs a free seat (organizer may ignore the deadline)
    const ok = await Event.findOneAndUpdate(
      { _id: reg.eventId._id, $expr: { $lt: ['$activeRegistrations', '$maxParticipants'] } },
      { $inc: { activeRegistrations: 1 } }
    );
    if (!ok) throw new ApiError(400, 'Event is full');
  }
  if (wasActive && !willBeActive) await releaseSeat(reg.eventId._id);
  reg.status = status;
  await reg.save();
  res.json(reg);
});

// PATCH /api/registrations/:id/cancel  (student cancels own registration before the event)
export const cancelRegistration = asyncHandler(async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('eventId');
  if (!reg || !reg.eventId) throw new ApiError(404, 'Registration not found');
  if (String(reg.studentId) !== String(req.user._id)) throw new ApiError(403, 'Not your registration');
  if (reg.status === 'cancelled') throw new ApiError(400, 'Registration is already cancelled');
  const status = computeStatus(reg.eventId);
  if (status === 'Completed' || status === 'Active') throw new ApiError(400, 'This registration can no longer be cancelled');
  reg.status = 'cancelled';
  await reg.save();
  await releaseSeat(reg.eventId._id);
  res.json(reg);
});
