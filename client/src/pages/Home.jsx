import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Settings, ShieldCheck, ArrowRight } from 'lucide-react';
import EventCard from '../components/events/EventCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { eventService } from '../services/eventService.js';

const features = [
  { icon: CalendarDays, title: 'Explore Events', text: 'Find and learn about upcoming college events.', color: 'text-blue-600 bg-blue-100' },
  { icon: Users, title: 'Easy Registration', text: 'Quick and simple event registration process.', color: 'text-green-600 bg-green-100' },
  { icon: Settings, title: 'Manage Events', text: 'Organizers can create, update and manage events.', color: 'text-purple-600 bg-purple-100' },
  { icon: ShieldCheck, title: 'Secure and Reliable', text: 'Your data is safe with our secure platform.', color: 'text-amber-600 bg-amber-100' },
];

export default function Home() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    eventService.list({ upcoming: true, limit: 4 }).then((d) => setEvents(d.items)).catch(() => setEvents([]));
  }, []);

  return (
    <div>
      <section className="relative text-white overflow-hidden bg-navy-900">
        <img
          src="/images/campus.jpg"
          alt="College campus"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 from-30% via-navy-900/75 via-55% to-navy-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Discover. Participate.<br />Be a Part of Something Great!</h1>
          <p className="mt-5 text-lg text-slate-200 max-w-xl">Stay updated with the latest college events, register for your favorite activities, and make the most of your college life.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/events" className="btn-primary px-6 py-3"><CalendarDays size={18} /> Explore Events</Link>
            <a href="#about" className="btn border-2 border-white/80 text-white px-6 py-3 hover:bg-white/10"><ArrowRight size={18} /> Learn More</a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-ink flex items-center gap-3"><CalendarDays /> Upcoming Events</h2>
            <p className="text-ink-muted mt-2">Explore the latest events organized by our college. Don't miss out!</p>
          </div>
          <Link to="/events" className="btn bg-brand-50 text-brand-500">View All Events <ArrowRight size={16} /></Link>
        </div>
        {events === null ? <Loader /> : events.length === 0 ? (
          <p className="text-ink-muted mt-8">No upcoming events yet. Please check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {events.map((e) => <EventCard key={e._id} event={e} showRegister={false} compact />)}
          </div>
        )}
      </section>

      <section id="about" className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink">College Event Management System</h2>
            <p className="mt-3 text-ink-muted">Discover, participate and manage college events all in one place. Stay connected with your college community and never miss an event!</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${f.color}`}><f.icon size={22} /></div>
                <div><h3 className="font-semibold text-ink">{f.title}</h3><p className="text-sm text-ink-muted">{f.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
