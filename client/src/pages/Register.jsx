import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage } from '../services/api.js';
import { DEPARTMENTS, YEARS } from '../utils/format.js';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', rollNumber: '', department: '', academicYear: '', phone: '', password: '', confirm: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast('Password must be at least 6 characters', 'error');
    if (form.password !== form.confirm) return toast('Passwords do not match', 'error');
    setBusy(true);
    try {
      const { confirm, ...data } = form;
      await register(data);
      toast('Account created successfully');
      navigate('/events', { replace: true });
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="label">Full Name *</label><input required value={form.name} onChange={set('name')} placeholder="Enter your full name" className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Email Address *</label><input type="email" required value={form.email} onChange={set('email')} placeholder="Enter your email address" className="input" /></div>
        <div><label className="label">Roll Number *</label><input required value={form.rollNumber} onChange={set('rollNumber')} placeholder="Enter your roll number" className="input" /></div>
        <div><label className="label">Phone Number *</label><input type="tel" required pattern="[0-9+\-\s]{7,15}" value={form.phone} onChange={set('phone')} placeholder="Enter your phone number" className="input" /></div>
        <div><label className="label">Department *</label>
          <select required value={form.department} onChange={set('department')} className="input"><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div><label className="label">Academic Year *</label>
          <select required value={form.academicYear} onChange={set('academicYear')} className="input"><option value="">Select year</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
        <div><label className="label">Password *</label><input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" className="input" /></div>
        <div><label className="label">Confirm Password *</label><input type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" className="input" /></div>
        <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 py-3"><UserPlus size={18} /> {busy ? 'Creating account...' : 'Create Account'}</button>
        <p className="sm:col-span-2 text-center text-sm text-ink-muted">Already have an account? <Link to="/login" className="text-brand-500 font-medium">Login here</Link></p>
      </form>
    </AuthShell>
  );
}
