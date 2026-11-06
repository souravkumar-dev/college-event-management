import Event, { CATEGORIES } from '../models/Event.js';
import Registration from '../models/Registration.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';

const FIELDS = ['eventName', 'category', 'eventType', 'date', 'time', 'venue', 'description', 'image', 'highlights', 'gallery', 'tagline', 'organizerName', 'department', 'contactEmail', 'contactPhone', 'maxParticipants', 'registrationDeadline', 'published'];

const pick = (body) => {
  const data = {};
  FIELDS.forEach((f) => { if (body[f] !== undefined) data[f] = body[f]; });
  if (Array.isArray(data.highlights)) data.highlights = data.highlights.map((h) => String(h).trim()).filter(Boolean);
  if (Array.isArray(data.gallery)) data.gallery = data.gallery.map((g) => String(g).trim()).filter((g) => /^(https?:\/\/|\/)/.test(g)).slice(0, 12);
  return data;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/events?search=&category=&page=&limit=
export const listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const filter = { published: { $ne: false } };
  if (req.query.search) filter.eventName = { $regex: escapeRegex(req.query.search), $options: 'i' };
  if (req.query.category && CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
  if (req.query.upcoming === 'true') {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    filter.date = { $gte: today };
    filter.status = { $ne: 'Cancelled' };
  }
  const [items, total] = await Promise.all([
    Event.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit),
    Event.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

// GET /api/events/:id
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(event);
});

// GET /api/events/organizer/my-events
export const myEvents = asyncHandler(async (req, res) => {
  const items = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

// POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (new Date(data.registrationDeadline) > new Date(data.date)) {
    throw new ApiError(400, 'Registration deadline must be on or before the event date');
  }
  const event = await Event.create({ ...data, createdBy: req.user._id });
  res.status(201).json(event);
});

const ownEvent = async (req) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (String(event.createdBy) !== String(req.user._id)) throw new ApiError(403, 'You can only manage your own events');
  return event;
};

// PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await ownEvent(req);
  const data = pick(req.body);
  if (data.maxParticipants !== undefined && Number(data.maxParticipants) < event.activeRegistrations) {
    throw new ApiError(400, `Max participants cannot be below current registrations (${event.activeRegistrations})`);
  }
  if (req.body.status === 'Cancelled') event.status = 'Cancelled';
  if (req.body.status && req.body.status !== 'Cancelled' && event.status === 'Cancelled') event.status = 'Upcoming';
  Object.assign(event, data);
  if (new Date(event.registrationDeadline) > new Date(event.date)) {
    throw new ApiError(400, 'Registration deadline must be on or before the event date');
  }
  await event.save();
  res.json(event);
});

// DELETE /api/events/:id  (also removes its registrations)
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await ownEvent(req);
  await Registration.deleteMany({ eventId: event._id });
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});
