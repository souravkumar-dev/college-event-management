import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, GraduationCap } from 'lucide-react';
import Loader from '../components/common/Loader.jsx';
import NotFound from './NotFound.jsx';
import { registrationService } from '../services/registrationService.js';
import { fmtDate } from '../utils/format.js';

// Printable certificate for a confirmed registration.
// Before the event it is a "Registration Confirmation"; after the event it becomes a "Certificate of Participation".
export default function Certificate() {
  const { id } = useParams();
  const [reg, setReg] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => { registrationService.get(id).then(setReg).catch(() => setMissing(true)); }, [id]);

  if (missing) return <NotFound title="Certificate not found" />;
  if (!reg) return <Loader />;
  if (reg.status !== 'confirmed') {
    return <NotFound title="Certificate not available" text="A certificate is available only for confirmed registrations." />;
  }

  const ev = reg.eventId;
  const finished = ev.status === 'Completed';
  const title = finished ? 'Certificate of Participation' : 'Registration Confirmation';
  const line = finished ? 'has successfully participated in' : 'is confirmed as a participant for';

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Link to={-1} className="inline-flex items-center gap-2 text-brand-500 text-sm"><ArrowLeft size={16} /> Back</Link>
        <button onClick={() => window.print()} className="btn-primary"><Printer size={16} /> Print / Save as PDF</button>
      </div>
      <div className="bg-white mx-auto max-w-4xl aspect-[1.414] border-[10px] border-navy-900 p-2 shadow-lg print:shadow-none">
        <div className="h-full border-2 border-amber-400 flex flex-col items-center justify-center text-center px-10">
          <GraduationCap size={48} className="text-navy-900" />
          <p className="mt-2 text-sm tracking-widest text-ink-muted uppercase">College Event Management</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-serif font-bold text-navy-900">{title}</h1>
          <p className="mt-6 text-ink-muted">This is to certify that</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold text-brand-500">{reg.fullName}</p>
          <p className="mt-1 text-sm text-ink-muted">{reg.rollNumber} · {reg.department} · {reg.academicYear}</p>
          <p className="mt-5 text-ink-muted">{line}</p>
          <p className="mt-2 text-xl font-semibold text-ink">{ev.eventName}</p>
          <p className="mt-1 text-sm text-ink-muted">{fmtDate(ev.date)} · {ev.time} · {ev.venue}</p>
          <div className="mt-10 flex w-full justify-between text-sm text-ink-muted">
            <div><p className="font-medium text-ink">{ev.organizerName || 'Organizer'}</p><p>Issued on {fmtDate(new Date())}</p></div>
            <div><p className="font-medium text-ink">Registration ID</p><p className="font-mono text-xs">{reg._id}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
