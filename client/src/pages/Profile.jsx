import { useState } from 'react';
import { UserCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';
import { DEPARTMENTS, YEARS } from '../utils/format.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '', rollNumber: user.rollNumber || '', department: user.department || '',
    academicYear: user.academicYear || '', phone: user.phone || '', password: '',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isStudent = user.role === 'student';

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      setUser(await authService.updateMe(data));
      setForm({ ...form, password: '' });
      toast('Profile updated');
    } catch (err) { toast(errorMessage(err), 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><UserCircle /> Profile</h1>
      <p className="text-ink-muted mt-1 mb-6">Update your account details.</p>
      <form onSubmit={submit} className="card p-6 grid sm:grid-cols-2 gap-5">
        <div><label className="label">Full Name</label><input required value={form.name} onChange={set('name')} className="input" /></div>
        <div><label className="label">Email (cannot be changed)</label><input value={user.email} readOnly className="input bg-slate-50" /></div>
        {isStudent && (
          <>
            <div><label className="label">Roll Number</label><input value={form.rollNumber} onChange={set('rollNumber')} className="input" /></div>
            <div><label className="label">Phone Number</label><input value={form.phone} onChange={set('phone')} className="input" /></div>
            <div><label className="label">Department</label>
              <select value={form.department} onChange={set('department')} className="input"><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className="label">Academic Year</label>
              <select value={form.academicYear} onChange={set('academicYear')} className="input"><option value="">Select year</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
          </>
        )}
        <div><label className="label">New Password (optional)</label><input type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="Leave blank to keep current" className="input" /></div>
        <div><label className="label">Role</label><input value={user.role} readOnly className="input bg-slate-50 capitalize" /></div>
        <button type="submit" disabled={busy} className="btn-primary sm:col-span-2"><Save size={16} /> {busy ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
