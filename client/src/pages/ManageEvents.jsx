import { useEffect, useState } from 'react';
import SafeImage from '../components/common/SafeImage.jsx';
import { Link } from 'react-router-dom';
import { CalendarRange, Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import StatusBadge, { CategoryBadge } from '../components/common/StatusBadge.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { eventService } from '../services/eventService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useConfirm } from '../components/common/ConfirmDialog.jsx';
import { fmtDate } from '../utils/format.js';

export default function ManageEvents() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');

  const load = () => eventService.myEvents().then(setItems).catch((e) => { toast(errorMessage(e), 'error'); setItems([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (e) => {
    if (!(await confirm({ title: `Delete "${e.eventName}"?`, text: 'All registrations for this event will also be removed. This cannot be undone.', confirmText: 'Delete event' }))) return;
    try { await eventService.remove(e._id); toast('Event deleted'); load(); } catch (err) { toast(errorMessage(err), 'error'); }
  };

  const list = (items || []).filter((e) => e.eventName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><CalendarRange /> Manage Events</h1>
          <p className="text-ink-muted mt-1">Create, edit and delete your events.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64"><Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events..." className="input pl-9" /></div>
          <Link to="/organizer/events/create" className="btn-primary whitespace-nowrap"><Plus size={16} /> Add New Event</Link>
        </div>
      </div>
      {!items ? <Loader /> : list.length === 0 ? (
        <EmptyState title="No events" text="Create your first event to get started." action={<Link to="/organizer/events/create" className="btn-primary"><Plus size={16} /> Add New Event</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-50 text-left text-ink-muted">
              <tr>{['Event', 'Date', 'Venue', 'Category', 'Status', 'Seats', 'Deadline', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><SafeImage src={e.image} alt={""} className="w-14 h-10 rounded object-cover bg-slate-200" /><span className="font-medium text-ink">{e.eventName}</span></div></td>
                  <td className="px-4 py-3">{fmtDate(e.date)}<br /><span className="text-xs text-ink-muted">{e.time}</span></td>
                  <td className="px-4 py-3">{e.venue}</td>
                  <td className="px-4 py-3"><CategoryBadge category={e.category} /></td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">{e.activeRegistrations} / {e.maxParticipants}</td>
                  <td className="px-4 py-3">{fmtDate(e.registrationDeadline)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/events/${e._id}`} className="btn-outline px-2.5 py-1.5" title="View"><Eye size={14} /></Link>
                      <Link to={`/organizer/events/edit/${e._id}`} className="btn-primary px-2.5 py-1.5" title="Edit"><Pencil size={14} /></Link>
                      <button onClick={() => remove(e)} className="btn-danger px-2.5 py-1.5" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
