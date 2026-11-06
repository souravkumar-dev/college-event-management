import { useEffect, useState } from 'react';
import SafeImage from '../components/common/SafeImage.jsx';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Send, Calendar, Clock, MapPin, Users, CheckCircle2, Lock } from 'lucide-react';
import Loader from '../components/common/Loader.jsx';
import NotFound from './NotFound.jsx';
import { eventService } from '../services/eventService.js';
import { registrationService } from '../services/registrationService.js';
import { errorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmtDate, DEPARTMENTS, YEARS } from '../utils/format.js';

export default function EventRegistration() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '', rollNumber: user?.rollNumber || '', department: user?.department || '',
    academicYear: user?.academicYear || '', email: user?.email || '', phone: user?.phone || '', additionalDetails: '', acceptTerms: false,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { eventService.get(id).then(setEvent).catch(() => setMissing(true)); }, [id]);

  if (missing) return <NotFound title="Event not found" />;
  if (!event) return <Loader />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.acceptTerms) return toast('Please accept the terms and conditions', 'error');
    setBusy(true);
    try {
      await registrationService.create({ ...form, acceptTerms: 'true', eventId: id });
      setUser({ ...user, rollNumber: form.rollNumber, department: form.department, academicYear: form.academicYear, phone: form.phone });
      toast('Registration submitted! Status: pending');
      navigate('/student/registrations');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link to={`/events/${id}`} className="inline-flex items-center gap-2 text-brand-500 text-sm mb-4"><ArrowLeft size={16} /> Back to Events</Link>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <div className="card p-6">
          <div className="relative h-56 rounded-lg overflow-hidden bg-slate-200">
            <SafeImage src={event.image} alt={event.eventName} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs px-3 py-1 rounded-md">{event.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink mt-5">{event.eventName}</h1>
          <p className="text-ink-muted text-sm mt-1 line-clamp-3">{event.description}</p>
          <div className="grid grid-cols-3 gap-4 mt-5 text-sm border-t border-slate-100 pt-5">
            <div className="flex gap-2"><Calendar size={18} className="text-brand-500 shrink-0" /><div><p className="text-ink-muted">Date</p><p className="font-medium">{fmtDate(event.date)}</p></div></div>
            <div className="flex gap-2"><Clock size={18} className="text-brand-500 shrink-0" /><div><p className="text-ink-muted">Time</p><p className="font-medium">{event.time}</p></div></div>
            <div className="flex gap-2"><MapPin size={18} className="text-brand-500 shrink-0" /><div><p className="text-ink-muted">Venue</p><p className="font-medium">{event.venue}</p></div></div>
          </div>
          {event.highlights?.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm">
              {event.highlights.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" /> {h}</li>)}
            </ul>
          )}
          <div className="mt-6 bg-brand-50 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 items-start"><Users size={18} className="text-brand-500 mt-1" />
              <div><p className="font-medium text-ink text-sm">Already registered?</p><p className="text-xs text-ink-muted">View your registration details in the My Registrations section.</p></div></div>
            <Link to="/student/registrations" className="btn-outline text-xs">View Registrations →</Link>
          </div>
        </div>

        {!event.registrationOpen ? (
          <div className="card p-6 flex flex-col items-center justify-center text-center">
            <Lock className="text-danger" size={36} />
            <p className="font-semibold text-ink mt-3">Registration is closed for this event</p>
            <p className="text-sm text-ink-muted">The deadline has passed, the event is full, or it was cancelled.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card p-6">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-3"><UserPlus /> Event Registration</h2>
            <p className="text-ink-muted text-sm mt-1">Fill in the details below to register for this event.</p>
            <div className="grid sm:grid-cols-2 gap-5 mt-6">
              <div><label className="label">Full Name *</label><input required value={form.fullName} onChange={set('fullName')} placeholder="Enter your full name" className="input" /></div>
              <div><label className="label">Roll Number *</label><input required value={form.rollNumber} onChange={set('rollNumber')} placeholder="Enter your roll number" className="input" /></div>
              <div><label className="label">Department *</label>
                <select required value={form.department} onChange={set('department')} className="input"><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div><label className="label">Academic Year *</label>
                <select required value={form.academicYear} onChange={set('academicYear')} className="input"><option value="">Select year</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="label">Email Address *</label><input type="email" required value={form.email} onChange={set('email')} placeholder="Enter your email address" className="input" /></div>
              <div><label className="label">Phone Number *</label><input type="tel" required pattern="[0-9+\-\s]{7,15}" value={form.phone} onChange={set('phone')} placeholder="Enter your phone number" className="input" /></div>
              <div><label className="label">Event Name</label><input value={event.eventName} readOnly className="input bg-slate-50" /></div>
              <div className="sm:col-span-2"><label className="label">Additional Details (Optional)</label>
                <textarea rows={4} value={form.additionalDetails} onChange={set('additionalDetails')} placeholder="Any special notes or requirements..." className="input" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm mt-5">
              <input type="checkbox" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} className="accent-brand-500 w-4 h-4" />
              I agree to the <span className="text-brand-500">terms and conditions</span> of the event.
            </label>
            <button type="submit" disabled={busy} className="btn-primary w-full mt-5 py-3"><Send size={16} /> {busy ? 'Submitting...' : 'Register Now'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
