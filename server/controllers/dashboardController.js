import Event, { computeStatus } from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const countByStatus = (rows) => {
  const out = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
  rows.forEach((r) => { out[r._id] = r.n; out.total += r.n; });
  return out;
};

// GET /api/dashboard/student
export const studentStats = asyncHandler(async (req, res) => {
  const rows = await Registration.aggregate([
    { $match: { studentId: req.user._id } },
    { $group: { _id: '$status', n: { $sum: 1 } } },
  ]);
  res.json(countByStatus(rows));
});

// GET /api/dashboard/organizer
export const organizerStats = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  const ids = events.map((e) => e._id);

  const [statusRows, perEvent, perCategory] = await Promise.all([
    Registration.aggregate([{ $match: { eventId: { $in: ids } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Registration.aggregate([
      { $match: { eventId: { $in: ids } } },
      { $group: {
        _id: '$eventId',
        registrations: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      } },
    ]),
    Registration.aggregate([
      { $match: { eventId: { $in: ids }, status: { $ne: 'cancelled' } } },
      { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $group: { _id: '$event.category', n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ]),
  ]);

  const byId = Object.fromEntries(perEvent.map((p) => [String(p._id), p]));
  const overview = events.slice(0, 6).map((e) => ({
    eventName: e.eventName,
    registrations: byId[String(e._id)]?.registrations || 0,
    pending: byId[String(e._id)]?.pending || 0,
  }));

  const recentEvents = events.slice(0, 5).map((e) => ({ ...e.toJSON(), status: computeStatus(e) }));
  res.json({
    totalEvents: events.length,
    registrations: countByStatus(statusRows),
    overview,
    byCategory: perCategory.map((c) => ({ category: c._id, count: c.n })),
    recentEvents,
  });
});
