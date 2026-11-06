import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, CheckCircle2, Clock, XCircle, Search, Eye, X, Award } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import StatusBadge, { CategoryBadge } from '../components/common/StatusBadge.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { registrationService } from '../services/registrationService.js';
import { eventService } from '../services/eventService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { fmtDate } from '../utils/format.js';

export default function RegistrationManagement() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ search: '', eventId: '', status: params.get('status') || '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { eventService.myEvents().then(setEvents).catch(() => {}); }, []);

  const load = useCallback(() => {
    const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    registrationService.all({ ...query, page, limit: 10 }).then(setData).catch((e) => { toast(errorMessage(e), 'error'); setData({ items: [], summary: {}, pages: 1 }); });
  }, [filters, page, toast]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const set = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  const changeStatus = async (id, status) => {
    try {
      await registrationService.setStatus(id, status);
      toast(`Registration ${status}`);
      setSelected(null);
      load();
    } catch (err) { toast(errorMessage(err), 'error'); }
  };

  const s = data?.summary || {};

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><Users /> Registration Management</h1>
      <p className="text-ink-muted mt-1">View and manage student registrations across your events.</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 my-6">
        <StatCard icon={Users} color="bg-blue-100 text-blue-600" label="Total Registrations" value={s.total || 0} />
        <StatCard icon={CheckCircle2} color="bg-green-100 text-green-600" label="Confirmed" value={s.confirmed || 0} />
        <StatCard icon={Clock} color="bg-amber-100 text-amber-600" label="Pending" value={s.pending || 0} />
        <StatCard icon={XCircle} color="bg-red-100 text-red-500" label="Cancelled" value={s.cancelled || 0} />
      </div>

      <div className="card p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5 mb-6">
        <div className="relative xl:col-span-2"><Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input value={filters.search} onChange={set('search')} placeholder="Search student name, email, roll no. or event" className="input pl-9" /></div>
        <select value={filters.eventId} onChange={set('eventId')} className="input">
          <option value="">All Events</option>{events.map((e) => <option key={e._id} value={e._id}>{e.eventName}</option>)}
        </select>
        <select value={filters.status} onChange={set('status')} className="input">
          <option value="">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
        </select>
        <div className="flex gap-2">
          <input type="date" value={filters.from} onChange={set('from')} className="input" title="Registered from" />
          <input type="date" value={filters.to} onChange={set('to')} className="input" title="Registered to" />
        </div>
      </div>

      {!data ? <Loader /> : data.items.length === 0 ? (
        <EmptyState title="No registrations found" text="Try changing the filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[1050px]">
            <thead className="bg-slate-50 text-left text-ink-muted">
              <tr>{['Student Details', 'Event Name', 'Date & Time', 'Venue', 'Category', 'Status', 'Registered On', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center font-semibold shrink-0">{r.fullName?.[0]?.toUpperCase()}</span>
                    <div><p className="font-medium text-ink">{r.fullName}</p><p className="text-xs text-ink-muted">({r.rollNumber}) · {r.department}</p></div>
                  </div></td>
                  <td className="px-4 py-3">{r.eventId?.eventName}</td>
                  <td className="px-4 py-3">{fmtDate(r.eventId?.date)}<br /><span className="text-xs text-ink-muted">{r.eventId?.time}</span></td>
                  <td className="px-4 py-3">{r.eventId?.venue}</td>
                  <td className="px-4 py-3"><CategoryBadge category={r.eventId?.category} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">{fmtDate(r.registrationDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(r)} className="btn-outline px-2.5 py-1.5" title="View"><Eye size={14} /></button>
                      {r.status === 'confirmed' && <Link to={`/certificate/${r._id}`} className="btn-outline px-2.5 py-1.5 text-xs"><Award size={14} /> Certificate</Link>}
                      {r.status !== 'confirmed' && <button onClick={() => changeStatus(r._id, 'confirmed')} className="btn-primary px-2.5 py-1.5 text-xs">Confirm</button>}
                      {r.status !== 'cancelled' && <button onClick={() => changeStatus(r._id, 'cancelled')} className="btn-danger px-2.5 py-1.5 text-xs">Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">Showing {data.items.length} of {data.total} registrations</p>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-ink">Registration details</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <dl className="mt-4 text-sm divide-y divide-slate-100">
              {[['Name', selected.fullName], ['Roll Number', selected.rollNumber], ['Department', selected.department], ['Academic Year', selected.academicYear],
                ['Email', selected.email], ['Phone', selected.phone], ['Event', selected.eventId?.eventName], ['Registered On', fmtDate(selected.registrationDate)],
                ['Additional Details', selected.additionalDetails || '—']].map(([k, v]) => (
                <div key={k} className="flex py-2"><dt className="w-1/3 text-ink-muted">{k}</dt><dd className="w-2/3 break-words">{v}</dd></div>
              ))}
              <div className="flex py-2 items-center"><dt className="w-1/3 text-ink-muted">Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
            </dl>
            <div className="flex gap-3 mt-5 justify-end">
              {selected.status !== 'pending' && <button onClick={() => changeStatus(selected._id, 'pending')} className="btn-outline">Mark Pending</button>}
              {selected.status !== 'confirmed' && <button onClick={() => changeStatus(selected._id, 'confirmed')} className="btn-primary">Confirm</button>}
              {selected.status !== 'cancelled' && <button onClick={() => changeStatus(selected._id, 'cancelled')} className="btn-danger">Cancel</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
