import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import UserMenu from '../components/common/UserMenu.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useConfirm } from '../components/common/ConfirmDialog.jsx';

// Shared shell for the student and organizer panels: navy header + left sidebar
export default function DashboardLayout({ items, topItems = [] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out?',
      text: 'Are you sure you want to log out of your account?',
      confirmText: 'Yes, Log out',
    });
    if (!ok) return;
    await logout();
    navigate('/');
  };

  const side = (
    <nav className="space-y-1">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md text-sm ${isActive ? 'bg-brand-500 text-white' : 'text-slate-200 hover:bg-navy-800'}`}>
          <i.icon size={18} /> {i.label}
        </NavLink>
      ))}
      <button onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm text-slate-200 hover:bg-navy-800 hover:text-red-400 transition-colors">
        <LogOut size={18} /> Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-900 sticky top-0 z-30">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
            <Link to="/"><Logo /></Link>
          </div>
          <nav className="hidden xl:flex items-center gap-8">
            {topItems.map((i) => (
              <NavLink key={i.label} to={i.to} end={i.end}
                className={({ isActive }) => `text-sm font-medium pb-1 border-b-2 ${isActive ? 'text-white border-brand-500' : 'text-slate-200 border-transparent hover:text-white'}`}>
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/events?search=${encodeURIComponent(q)}`); }}
              className="hidden md:flex items-center gap-2 bg-navy-800 rounded-md px-3 py-2 w-64">
              <Search size={16} className="text-slate-300" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events..." className="bg-transparent text-sm text-white placeholder-slate-300 outline-none w-full" />
            </form>
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:block w-60 bg-navy-900 py-6 px-3 shrink-0">{side}</aside>
        {open && (
          <div className="lg:hidden fixed inset-0 top-16 z-20 bg-black/40" onClick={() => setOpen(false)}>
            <aside className="w-64 h-full bg-navy-900 py-6 px-3" onClick={(e) => e.stopPropagation()}>{side}</aside>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
