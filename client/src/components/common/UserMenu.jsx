import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-white text-sm">
        <span className="w-8 h-8 rounded-full bg-slate-200 text-navy-900 flex items-center justify-center font-semibold">{user.name[0]}</span>
        <span className="hidden sm:inline capitalize">{user.role}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 card py-1 z-40" onMouseLeave={() => setOpen(false)}>
          <p className="px-4 py-2 text-xs text-ink-muted truncate">{user.email}</p>
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-50" onClick={() => setOpen(false)}><UserCircle size={16} /> Profile</Link>
          <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-50"><LogOut size={16} /> Logout</button>
        </div>
      )}
    </div>
  );
}
