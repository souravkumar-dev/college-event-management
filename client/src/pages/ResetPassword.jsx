import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast('Passwords do not match', 'error');
    try {
      const r = await authService.resetPassword(params.get('token'), password);
      toast(r.message);
      navigate('/login');
    } catch (err) { toast(errorMessage(err), 'error'); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <form onSubmit={submit} className="card p-8 space-y-4">
        <h1 className="text-2xl font-bold text-ink">Set a new password</h1>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="input" />
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="input" />
        <button className="btn-primary w-full">Update password</button>
        <Link to="/login" className="block text-center text-sm text-brand-500">Back to login</Link>
      </form>
    </div>
  );
}
