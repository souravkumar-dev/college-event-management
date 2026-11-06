import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try { setResult(await authService.forgotPassword(email)); } catch (err) { toast(errorMessage(err), 'error'); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-ink">Forgot password</h1>
        <p className="text-sm text-ink-muted mt-1">Enter your account email to get a reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="input" />
          <button className="btn-primary w-full">Send reset link</button>
        </form>
        {result && (
          <div className="mt-5 text-sm bg-brand-50 rounded-md p-3">
            <p>{result.message}</p>
            {result.resetLink && <a href={result.resetLink} className="text-brand-500 break-all">Open reset link (development mode)</a>}
          </div>
        )}
        <Link to="/login" className="block text-center text-sm text-brand-500 mt-5">Back to login</Link>
      </div>
    </div>
  );
}
