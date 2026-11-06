import { useCallback, useEffect, useState } from 'react';
import SafeImage from '../components/common/SafeImage.jsx';
import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Clock, XCircle, Search, Eye, MapPin, Award } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import StatusBadge, { CategoryBadge } from '../components/common/StatusBadge.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { registrationService, dashboardService } from '../services/registrationService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useConfirm } from '../components/common/ConfirmDialog.jsx';
import { authService } from '../services/authService.js';
import EventCard from '../components/events/EventCard.jsx';
import { fmtDate } from '../utils/format.js';

export default function MyRegistrations() {
  const toast = useToast();
  const confirm = useConfirm();
  const [saved, setSaved] = useState([]);
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    registrationService.mine({ search: search || undefined, status: status || undefined }).then(setItems).catch((e) => { toast(errorMessage(e), 'error'); setItems([]); });
    dashboardService.student().then(setStats).catch(() => {});
    authService.saved().then(setSaved).catch(() => {});
  }, [search, status, toast]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const cancel = async (id) => {
    if (!(await confirm({ title: 'Cancel this registration?', text: 'Your seat will be released for other students.', confirmText: 'Cancel registration' }))) return;
    try {
      await registrationService.cancel(id);
      toast('Registration cancelled');
      load();
    } catch (err) { toast(errorMessage(err), 'error'); }
  };

  const canCancel = (r) => r.status !== 'cancelled' && ['Upcoming'].includes(r.eventId.status);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><CalendarCheck /> My Registrations</h1>
          <p className="text-ink-muted mt-1">View and manage your event registrations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative md:w-72"><Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by event name..." className="input pl-9" /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-40">
            <option value="">All Status</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard icon={CalendarCheck} color="bg-blue-100 text-blue-600" label="Total Registrations" value={stats.total} />
        <StatCard icon={CheckCircle2} color="bg-green-100 text-green-600" label="Confirmed" value={stats.confirmed} />
        <StatCard icon={Clock} color="bg-amber-100 text-amber-600" label="Pending" value={stats.pending} />
        <StatCard icon={XCircle} color="bg-red-100 text-red-500" label="Cancelled" value={stats.cancelled} />
      </div>

      {!items ? <Loader /> : items.length === 0 ? (
        <EmptyState title="No registrations yet" text="Browse events and register for the ones you like." action={<Link to="/events" className="btn-primary">Browse Events</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-slate-50 text-left text-ink-muted">
              <tr>{['#', 'Event Name', 'Date & Time', 'Venue', 'Category', 'Registered On', 'Status', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r, i) => (
                <tr key={r._id}>
                  <td className="px-4 py-4">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <SafeImage src={r.eventId.image} alt={""} className="w-20 h-14 rounded-md object-cover bg-slate-200" />
                      <div><p className="font-semibold text-ink">{r.eventId.eventName}</p><p className="text-xs text-ink-muted max-w-xs line-clamp-2">{r.eventId.description}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><p>{fmtDate(r.eventId.date)}</p><p className="text-xs text-ink-muted">{r.eventId.time}</p></td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1"><MapPin size={14} /> {r.eventId.venue}</span></td>
                  <td className="px-4 py-4"><CategoryBadge category={r.eventId.category} /></td>
                  <td className="px-4 py-4">{fmtDate(r.registrationDate)}</td>
                  <td className="px-4 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link to={`/events/${r.eventId._id}`} className="btn-primary px-3 py-2 text-xs"><Eye size={14} /> View Details</Link>
                      {r.status === 'confirmed' && <Link to={`/certificate/${r._id}`} className="btn-outline px-3 py-2 text-xs"><Award size={14} /> Certificate</Link>}
                      {canCancel(r) && <button onClick={() => cancel(r._id)} className="btn-danger px-3 py-2 text-xs"><XCircle size={14} /> Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-sm text-ink-muted border-t border-slate-100">Showing {items.length} registration{items.length === 1 ? '' : 's'}</p>
        </div>
      )}

      {saved.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink mb-4">Saved for Later</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {saved.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
