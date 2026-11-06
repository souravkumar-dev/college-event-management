import { useEffect, useState } from 'react';
import SafeImage from '../components/common/SafeImage.jsx';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, UserPlus, Pencil, Info, Star, Bookmark, Lock } from 'lucide-react';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import NotFound from './NotFound.jsx';
import { eventService } from '../services/eventService.js';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmtDate } from '../utils/format.js';

const tabs = ['About', 'Rules & Guidelines', 'Gallery', 'Contact'];

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState('About');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    eventService.get(id).then(setEvent).catch(() => setMissing(true));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    authService.saved().then((list) => setIsSaved(list.some((e) => e._id === id))).catch(() => {});
  }, [id, user]);

  if (missing) return <NotFound title="Event not found" text="This event does not exist or was removed." />;
  if (!event) return <Loader />;

  const closedReason = event.status === 'Cancelled' ? 'This event has been cancelled.'
    : event.status === 'Completed' ? 'This event has already finished.'
      : event.deadlinePassed ? 'Registration is closed (deadline passed).'
        : event.availableSeats <= 0 ? 'Registration is closed (event is full).' : '';

  const onRegister = () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}/register` } });
    navigate(`/events/${id}/register`);
  };

  const saveForLater = async () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } });
    try {
      if (isSaved) { await authService.unsave(id); setIsSaved(false); toast('Removed from saved events'); }
      else { await authService.save(id); setIsSaved(true); toast('Saved for later'); }
    } catch (err) { toast(errorMessage(err), 'error'); }
  };

  return (
    <div className={user ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-8'}>
      <Link to="/events" className="inline-flex items-center gap-2 text-brand-500 text-sm mb-4"><ArrowLeft size={16} /> Back to Events</Link>

      <div className="card p-6 grid gap-6 xl:grid-cols-[1fr_1.2fr_0.8fr]">
        <div className="relative h-64 xl:h-full min-h-64 rounded-lg overflow-hidden bg-slate-200">
          <SafeImage src={event.image} alt={event.eventName} className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs px-3 py-1 rounded-md">{event.category}</span>
        </div>
        <div>
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-ink">{event.eventName}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-ink-muted mt-2">{event.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <div className="flex gap-2"><Calendar className="text-brand-500 shrink-0" size={20} /><div><p className="text-ink-muted">Date</p><p className="font-medium">{fmtDate(event.date)}</p></div></div>
            <div className="flex gap-2"><Clock className="text-brand-500 shrink-0" size={20} /><div><p className="text-ink-muted">Time</p><p className="font-medium">{event.time}</p></div></div>
            <div className="flex gap-2"><MapPin className="text-brand-500 shrink-0" size={20} /><div><p className="text-ink-muted">Venue</p><p className="font-medium">{event.venue}</p></div></div>
            <div className="flex gap-2"><Users className="text-brand-500 shrink-0" size={20} /><div><p className="text-ink-muted">Type</p><p className="font-medium">{event.eventType}</p></div></div>
          </div>
          {event.highlights?.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold text-ink flex items-center gap-2"><Star size={18} className="text-brand-500" /> Event Highlights</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {event.highlights.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" /> {h}</li>)}
              </ul>
            </>
          )}
        </div>
        <aside className="bg-brand-50 rounded-lg p-5 h-fit">
          {user?.role === 'organizer' ? (
            <>
              <h3 className="font-semibold text-ink">Organizer actions</h3>
              {String(event.createdBy?._id) === String(user._id) ? (
                <Link to={`/organizer/events/edit/${event._id}`} className="btn-primary w-full mt-4"><Pencil size={16} /> Edit Event</Link>
              ) : <p className="text-sm text-ink-muted mt-2">This event belongs to another organizer.</p>}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-ink flex items-center gap-2"><UserPlus size={18} /> Register for Event</h3>
              <p className="text-sm text-ink-muted mt-2">{event.availableSeats} of {event.maxParticipants} seats available · Deadline {fmtDate(event.registrationDeadline)}</p>
              {closedReason ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-danger bg-red-50 rounded-md p-3"><Lock size={16} /> {closedReason}</p>
              ) : (
                <button onClick={onRegister} className="btn-primary w-full mt-4"><Pencil size={16} /> Register Now</button>
              )}
              <button onClick={saveForLater} className="btn-outline w-full mt-3"><Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved' : 'Save for Later'}</button>
              {user && <p className="mt-6 text-sm text-ink-muted">Already registered? <Link to="/student/registrations" className="text-brand-500">View My Registrations →</Link></p>}
            </>
          )}
        </aside>
      </div>

      <div className="card mt-6">
        <div className="flex gap-6 px-6 border-b border-slate-100 text-sm overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`py-4 border-b-2 whitespace-nowrap ${tab === t ? 'border-brand-500 text-brand-500 font-medium' : 'border-transparent text-ink-muted'}`}>{t}</button>
          ))}
        </div>
        <div className="p-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {tab === 'About' && (<><h3 className="font-semibold text-ink flex items-center gap-2"><Info size={18} /> About the Event</h3><p className="mt-3 text-sm text-ink-muted leading-relaxed whitespace-pre-line">{event.description}</p>
              {event.tagline && <p className="mt-5 bg-brand-50 rounded-lg p-4 font-semibold text-brand-500">🏆 {event.tagline}</p>}</>)}
            {tab === 'Rules & Guidelines' && (
              <ul className="list-disc pl-5 text-sm text-ink-muted space-y-2">
                <li>Register before {fmtDate(event.registrationDeadline)}.</li>
                <li>Carry your college ID card on the event day.</li>
                <li>Each student can register only once for this event.</li>
                <li>Organizers may confirm or cancel registrations as per seat availability.</li>
              </ul>
            )}
            {tab === 'Gallery' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[event.image, ...(event.gallery || [])].map((src, i) => (
                  <a key={src + i} href={src} target="_blank" rel="noreferrer" className="block aspect-video rounded-lg overflow-hidden bg-slate-200">
                    <SafeImage src={src} alt={`${event.eventName} photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
                  </a>
                ))}
              </div>
            )}
            {tab === 'Contact' && (
              <p className="text-sm text-ink-muted">Contact {event.organizerName || event.createdBy?.name} at {event.contactEmail || event.createdBy?.email}{event.contactPhone ? ` or ${event.contactPhone}` : ''}.</p>
            )}
          </div>
          <div className="border border-slate-100 rounded-lg">
            <h3 className="font-semibold text-ink px-4 py-3 border-b border-slate-100 flex items-center gap-2"><Info size={16} /> Event Information</h3>
            <dl className="text-sm divide-y divide-slate-100">
              {[
                ['Organizer', event.organizerName || event.createdBy?.name],
                ['Department', event.department],
                ['Registration Deadline', fmtDate(event.registrationDeadline)],
                ['Max Participants', event.maxParticipants],
                ['Seats Available', event.availableSeats],
                ['Contact Email', event.contactEmail || event.createdBy?.email],
                ['Contact Phone', event.contactPhone],
              ].filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => (
                <div key={k} className="flex px-4 py-2.5"><dt className="w-1/2 text-ink-muted">{k}</dt><dd className="w-1/2 text-ink break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
