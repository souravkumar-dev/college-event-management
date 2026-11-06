import { useEffect, useState } from 'react';
import SafeImage from '../components/common/SafeImage.jsx';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, CheckCircle2, Clock, Eye, Pencil, Plus, LayoutDashboard, BarChart3, PieChart, MapPin } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import EventChart from '../components/dashboard/EventChart.jsx';
import CategoryChart from '../components/dashboard/CategoryChart.jsx';
import StatusBadge, { CategoryBadge } from '../components/common/StatusBadge.jsx';
import Loader from '../components/common/Loader.jsx';
import { dashboardService } from '../services/registrationService.js';
import { errorMessage } from '../services/api.js';
import { fmtDate } from '../utils/format.js';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { dashboardService.organizer().then(setData).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <Loader />;
  const r = data.registrations;

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><LayoutDashboard /> Organizer Dashboard</h1>
      <p className="text-ink-muted mt-1">Welcome back! Here's an overview of your event activities.</p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mt-6">
        <StatCard icon={CalendarDays} color="bg-blue-100 text-blue-600" label="Total Events" value={data.totalEvents} to="/organizer/events" linkText="Manage Events" />
        <StatCard icon={Users} color="bg-green-100 text-green-600" label="Total Registrations" value={r.total} to="/organizer/registrations" linkText="View Registrations" />
        <StatCard icon={CheckCircle2} color="bg-purple-100 text-purple-600" label="Confirmed" value={r.confirmed} to="/organizer/registrations?status=confirmed" linkText="View Details" />
        <StatCard icon={Clock} color="bg-amber-100 text-amber-600" label="Pending" value={r.pending} to="/organizer/registrations?status=pending" linkText="View Details" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr] mt-6">
        <div className="card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h2 className="font-semibold text-ink flex items-center gap-2"><BarChart3 size={18} /> Event Overview</h2>
            <div className="flex gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Registrations</span>
              <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-sky-300" /> Pending</span>
            </div>
          </div>
          <EventChart data={data.overview} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-6"><PieChart size={18} /> Registrations by Category</h2>
          <CategoryChart data={data.byCategory} />
        </div>
      </div>

      <div className="card p-6 mt-6">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-ink flex items-center gap-2"><CalendarDays size={18} /> Recent Events</h2>
            <p className="text-sm text-ink-muted">Manage your upcoming and active events.</p>
          </div>
          <Link to="/organizer/events/create" className="btn-primary"><Plus size={16} /> Add New Event</Link>
        </div>
        {data.recentEvents.length === 0 ? <p className="text-sm text-ink-muted">No events yet. Create your first event.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 text-left text-ink-muted">
                <tr>{['#', 'Event Name', 'Date & Time', 'Venue', 'Category', 'Status', 'Registrations', 'Action'].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentEvents.map((e, i) => (
                  <tr key={e._id}>
                    <td className="px-3 py-3">{i + 1}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2 font-medium text-ink"><SafeImage src={e.image} alt={""} className="w-12 h-9 rounded object-cover bg-slate-200" />{e.eventName}</div></td>
                    <td className="px-3 py-3">{fmtDate(e.date)}<br /><span className="text-xs text-ink-muted">{e.time}</span></td>
                    <td className="px-3 py-3"><span className="inline-flex items-center gap-1"><MapPin size={14} />{e.venue}</span></td>
                    <td className="px-3 py-3"><CategoryBadge category={e.category} /></td>
                    <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-3 py-3">{e.activeRegistrations} / {e.maxParticipants}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Link to={`/events/${e._id}`} className="btn-primary px-3 py-1.5 text-xs"><Eye size={14} /> View</Link>
                        <Link to={`/organizer/events/edit/${e._id}`} className="btn-outline px-3 py-1.5 text-xs"><Pencil size={14} /> Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
