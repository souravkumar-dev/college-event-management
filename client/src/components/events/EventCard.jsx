import SafeImage from '../common/SafeImage.jsx';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Tag, ArrowRight } from 'lucide-react';
import { fmtDate, dayMonth } from '../../utils/format.js';

export default function EventCard({ event, showRegister = true, compact = false }) {
  const { day, month } = dayMonth(event.date);

  return (
    /*
     * h-full  → card stretches to fill the grid cell (makes all cards in a row equal height)
     * flex flex-col → children stack vertically
     */
    <div className="card overflow-hidden flex flex-col h-full">

      {/* ── Image ── */}
      <div className="relative h-40 bg-slate-200 shrink-0">
        <SafeImage src={event.image} alt={event.eventName} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-brand-500 text-white rounded-md px-2.5 py-1 text-center leading-tight">
          <div className="text-lg font-bold">{day}</div>
          <div className="text-xs">{month}</div>
        </div>
      </div>

      {/* ── Body — flex-1 so it expands to fill remaining card height ── */}
      <div className="p-4 flex flex-col flex-1">

        <h3 className="font-semibold text-ink text-base leading-snug">{event.eventName}</h3>

        <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
          <li className="flex items-center gap-2">
            <CalendarDays size={14} className="text-brand-500 shrink-0" />
            Date: {fmtDate(event.date)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={14} className="text-brand-500 shrink-0" />
            Venue: {event.venue}
          </li>
          <li className="flex items-center gap-2">
            <Tag size={14} className="text-brand-500 shrink-0" />
            Type: {event.category}
          </li>
        </ul>

        {/* Description — 2-line clamp, natural height (no flex-1 here!) */}
        {!compact && (
          <p className="text-sm text-ink-muted mt-3 line-clamp-2">{event.description}</p>
        )}

        {/*
         * Buttons — mt-auto pushes this block to the very bottom of the body.
         * Because body is flex-1 (fills card) and buttons are mt-auto,
         * they ALWAYS sit at the same Y position across all cards in a row.
         */}
        <div className="mt-auto pt-4 flex gap-2">

          {/* View Details — always visible, solid blue */}
          <Link
            to={`/events/${event._id}`}
            className="btn-primary flex-1 justify-between text-sm px-3 py-2"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>

          {/* Register — always rendered (when showRegister) so button row is consistent.
              Muted + non-clickable when registration is closed. */}
          {showRegister && (
            <Link
              to={event.registrationOpen
                ? `/events/${event._id}/register`
                : `/events/${event._id}`}
              className={`btn-outline flex-1 text-sm px-3 py-2 ${
                !event.registrationOpen ? 'opacity-50 pointer-events-none' : ''
              }`}
              aria-disabled={!event.registrationOpen}
              tabIndex={!event.registrationOpen ? -1 : undefined}
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
