import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, LogIn } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import GoogleButton from '../components/common/GoogleButton.jsx';
import { useAuth, homeFor } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage } from '../services/api.js';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password, remember);
      toast(`Welcome back, ${user.name}!`);
      const from = location.state?.from;
      const allowed = from && (user.role === 'organizer' ? from.startsWith('/organizer') : !from.startsWith('/organizer'));
      navigate(allowed ? from : homeFor(user), { replace: true });
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="bg-brand-50 rounded-lg p-4 flex gap-3 mb-6">
        <GraduationCap className="text-brand-500 shrink-0" />
        <div><p className="font-semibold text-ink">Welcome back!</p><p className="text-sm text-ink-muted">Login to access your events, registrations and more.</p></div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <div className="relative"><Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email address" className="input pl-9" /></div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            <input type={show ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="input pl-9 pr-10" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-400" aria-label="Show password">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-brand-500 w-4 h-4" /> Remember me</label>
          <Link to="/forgot-password" className="text-brand-500">Forgot password?</Link>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full py-3"><LogIn size={18} /> {busy ? 'Logging in...' : 'Login'}</button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="flex-1 h-px bg-slate-200" />OR<span className="flex-1 h-px bg-slate-200" /></div>
      <GoogleButton onCredential={async (credential) => {
        try { const u = await googleLogin(credential); toast(`Welcome, ${u.name}!`); navigate(homeFor(u), { replace: true }); }
        catch (err) { toast(errorMessage(err), 'error'); }
      }} />
      <p className="text-center text-sm text-ink-muted mt-5">Don't have an account? <Link to="/register" className="text-brand-500 font-medium">Register here</Link></p>
    </AuthShell>
  );
}
