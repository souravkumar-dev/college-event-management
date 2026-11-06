import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Menu, X, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import UserMenu from '../components/common/UserMenu.jsx';
import { useAuth, homeFor } from '../context/AuthContext.jsx';

export default function PublicLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Single source of truth: which nav item is active
  const [activeNav, setActiveNav] = useState('');

  // Keep activeNav in sync when URL changes (e.g. browser back/forward, direct link)
  useEffect(() => {
    if (location.pathname === '/') {
      // Don't override if user explicitly clicked About/Contact
      setActiveNav((prev) =>
        prev === 'about' || prev === 'contact' ? prev : 'home'
      );
    } else if (location.pathname.startsWith('/events')) {
      setActiveNav('events');
    } else {
      setActiveNav('');
    }
  }, [location.pathname]);

  const close = () => setOpen(false);

  /* Navigate to a route-based link */
  const goTo = (item, path) => {
    setActiveNav(item);
    navigate(path);
    close();
  };

  /* Scroll to an anchor section (About / Contact) */
  const goAnchor = (item) => {
    setActiveNav(item);
    close();
    const scroll = () =>
      document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname === '/') {
      scroll();
    } else {
      navigate('/');
      setTimeout(scroll, 180); // wait for Home to mount
    }
  };

  /* Nav item style — same for desktop and mobile (desktop variant) */
  const cls = (item) =>
    `text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer ${
      activeNav === item
        ? 'text-white border-brand-500'
        : 'text-slate-200 border-transparent hover:text-white'
    }`;

  /* Mobile item style */
  const mcls = (item) =>
    `block w-full text-left py-2 px-3 rounded-md font-medium transition ${
      activeNav === item
        ? 'bg-brand-500 text-white'
        : 'text-slate-200 hover:bg-navy-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ══ Sticky Navbar ══════════════════════════════════════════════ */}
      <header className="bg-navy-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="shrink-0" onClick={() => goTo('home', '/')}>
            <Logo />
          </Link>

          {/* Desktop nav — centred */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <button className={cls('home')}    onClick={() => goTo('home', '/')}>Home</button>
            <button className={cls('events')}  onClick={() => goTo('events', '/events')}>Events</button>
            <button className={cls('about')}   onClick={() => goAnchor('about')}>About</button>
            <button className={cls('contact')} onClick={() => goAnchor('contact')}>Contact</button>
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link to={homeFor(user)}
                  className="text-sm text-white border border-white/60 rounded-md px-4 py-2 hover:bg-white/10 transition">
                  Dashboard
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link to="/login"
                  className="flex items-center gap-2 border border-white/70 text-white text-sm px-4 py-2 rounded-md hover:bg-white/10 transition">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register"
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-md transition">
                  <UserPlus size={15} /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-3 space-y-1 text-sm">
            <button className={mcls('home')}    onClick={() => goTo('home', '/')}>Home</button>
            <button className={mcls('events')}  onClick={() => goTo('events', '/events')}>Events</button>
            <button className={mcls('about')}   onClick={() => goAnchor('about')}>About</button>
            <button className={mcls('contact')} onClick={() => goAnchor('contact')}>Contact</button>

            <div className="pt-2 border-t border-navy-700 space-y-1">
              {user ? (
                <Link to={homeFor(user)} onClick={close}
                  className="block py-2 px-3 rounded-md font-medium text-slate-200 hover:bg-navy-700">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={close}
                    className="flex items-center gap-2 py-2 px-3 rounded-md font-medium text-slate-200 hover:bg-navy-700">
                    <LogIn size={14} /> Login
                  </Link>
                  <Link to="/register" onClick={close}
                    className="flex items-center gap-2 py-2 px-3 rounded-md font-medium bg-brand-500 text-white hover:bg-brand-600">
                    <UserPlus size={14} /> Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══ Page content ═══════════════════════════════════════════════ */}
      <main className="flex-1"><Outlet /></main>

      {/* ══ Footer ═════════════════════════════════════════════════════ */}
      <footer id="contact" className="bg-navy-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold text-white">College Event Management</p>
            <p className="text-slate-400 mt-0.5">Organize | Participate | Grow</p>
          </div>
          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" aria-label="social"
                className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center hover:bg-brand-500 hover:text-white transition">
                <Icon size={15} />
              </a>
            ))}
          </div>
          <p className="text-slate-400">© {new Date().getFullYear()} College Event Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
