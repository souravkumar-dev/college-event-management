import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import EventForm from '../components/events/EventForm.jsx';
import { eventService } from '../services/eventService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AddEvent() {
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const save = async (data) => {
    setBusy(true);
    try {
      const { status, ...rest } = data;
      await eventService.create(rest);
      toast('Event created');
      navigate('/organizer/events');
    } catch (err) { toast(errorMessage(err), 'error'); } finally { setBusy(false); }
  };

  return (
    <div>
      <Link to="/organizer/events" className="inline-flex items-center gap-2 text-brand-500 text-sm mb-2"><ArrowLeft size={16} /> Back to Events</Link>
      <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><CalendarPlus /> Add New Event</h1>
      <p className="text-ink-muted mt-1 mb-6">Fill in the details below to create a new event.</p>
      <EventForm onSubmit={save} submitting={busy} />
    </div>
  );
}
