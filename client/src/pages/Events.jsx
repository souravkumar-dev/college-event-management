import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CalendarDays } from 'lucide-react';
import EventCard from '../components/events/EventCard.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { eventService, CATEGORIES } from '../services/eventService.js';
import { errorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Events() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const category = params.get('category') || '';
  const page = Number(params.get('page') || 1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setSearch(params.get('search') || ''); }, [params]);

  useEffect(() => {
    setData(null);
    const t = setTimeout(() => {
      eventService.list({ search: params.get('search') || undefined, category: category || undefined, page, limit: 8 })
        .then(setData).catch((e) => { setError(errorMessage(e)); setData({ items: [], pages: 1 }); });
    }, 250);
    return () => clearTimeout(t);
  }, [params, category, page]);

  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (!('page' in next)) p.delete('page');
    setParams(p);
  };

  return (
    <div className={user ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-10'}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><CalendarDays /> Upcoming Events</h1>
          <p className="text-ink-muted mt-1">Explore and register for exciting events happening in our college.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <form onSubmit={(e) => { e.preventDefault(); update({ search }); }} className="relative md:w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); update({ search: e.target.value }); }} placeholder="Search events..." className="input pl-9" />
          </form>
          <select value={category} onChange={(e) => update({ category: e.target.value })} className="input sm:w-48">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!data ? <Loader /> : data.items.length === 0 ? (
        <EmptyState title="No events found" text="Try a different search or category." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((e) => <EventCard key={e._id} event={e} showRegister={user?.role !== 'organizer'} />)}
          </div>
          <div className="mt-8 flex justify-center"><Pagination page={page} pages={data.pages} onChange={(p) => update({ page: String(p) })} /></div>
        </>
      )}
    </div>
  );
}
