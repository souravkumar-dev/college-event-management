import mongoose from 'mongoose';

export const CATEGORIES = ['Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Others'];
export const STATUSES = ['Upcoming', 'Active', 'Completed', 'Cancelled'];

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    eventType: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    highlights: [{ type: String, trim: true }],
    gallery: [{ type: String, trim: true }],
    tagline: { type: String, trim: true },
    organizerName: { type: String, trim: true },
    department: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    maxParticipants: { type: Number, required: true, min: 1 },
    registrationDeadline: { type: Date, required: true },
    // Only "Cancelled" is stored manually; the others are derived from dates (see computeStatus)
    status: { type: String, enum: STATUSES, default: 'Upcoming' },
    published: { type: Boolean, default: true },
    // Pending + confirmed registrations; updated atomically to enforce capacity
    activeRegistrations: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Registration stays open through the whole deadline day
export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const deadlinePassed = (deadline) => new Date(deadline) < startOfToday();

export function computeStatus(event, now = new Date()) {
  if (event.status === 'Cancelled') return 'Cancelled';
  const start = new Date(event.date);
  const dayEnd = new Date(start);
  dayEnd.setHours(23, 59, 59, 999);
  if (now > dayEnd) return 'Completed';
  if (now >= new Date(start.toDateString())) return 'Active';
  return 'Upcoming';
}

eventSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.status = computeStatus(ret);
    ret.availableSeats = Math.max(0, ret.maxParticipants - ret.activeRegistrations);
    ret.registrationOpen =
      ret.status !== 'Cancelled' && ret.status !== 'Completed' &&
      !deadlinePassed(ret.registrationDeadline) && ret.availableSeats > 0;
    ret.deadlinePassed = deadlinePassed(ret.registrationDeadline);
    return ret;
  },
});

export default mongoose.model('Event', eventSchema);
