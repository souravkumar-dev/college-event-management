import { NavLink } from 'react-router-dom';
import { CalendarDays, Users, Settings, ShieldCheck } from 'lucide-react';

const features = [
  { icon: CalendarDays, title: 'Explore Events', text: 'Find and learn about upcoming college events.', color: 'text-blue-600 bg-blue-100' },
  { icon: Users, title: 'Register Easily', text: 'Quick and simple event registration process.', color: 'text-green-600 bg-green-100' },
  { icon: Settings, title: 'Manage Events', text: 'Organizers can create, update and manage events.', color: 'text-purple-600 bg-purple-100' },
  { icon: ShieldCheck, title: 'Secure & Reliable', text: 'Your data is safe with our secure platform.', color: 'text-amber-600 bg-amber-100' },
];

// Left info panel + right card with Login / Register tabs (matches the login screenshot)
export default function AuthShell({ children }) {
  return (
    <div className="relative bg-gradient-to-b from-brand-50 to-white min-h-[calc(100vh-4rem)] overflow-hidden">
      <img src="/images/students.jpg" alt="" aria-hidden="true" className="hidden lg:block absolute bottom-0 left-0 w-1/2 max-w-3xl mix-blend-multiply" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-2 items-start">
        <div className="hidden lg:block pt-6">
          <h1 className="text-5xl font-bold text-ink leading-tight">College Event<br />Management System</h1>
          <p className="mt-4 text-lg text-ink-muted max-w-lg">Discover, participate and manage college events all in one place. Stay connected with your college community and never miss an event!</p>
          <div className="mt-10 grid grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${f.color}`}><f.icon size={22} /></div>
                <div><p className="font-semibold text-ink">{f.title}</p><p className="text-sm text-ink-muted">{f.text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6 sm:p-8 w-full max-w-lg mx-auto">
          <div className="flex border-b border-slate-200 mb-6">
            {[['/login', 'Login'], ['/register', 'Register']].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex-1 text-center pb-3 font-medium border-b-2 ${isActive ? 'border-brand-500 text-brand-500' : 'border-transparent text-ink-muted'}`}>{label}</NavLink>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
