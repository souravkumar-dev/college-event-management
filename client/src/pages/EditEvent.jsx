import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import EventForm from '../components/events/EventForm.jsx';
import Loader from '../components/common/Loader.jsx';
import NotFound from './NotFound.jsx';
import { eventService } from '../services/eventService.js';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function EditEvent() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { eventService.get(id).then(setEvent).catch(() => setMissing(true)); }, [id]);

  if (missing) return <NotFound title="Event not found" />;
  if (!event) return <Loader />;

  const save = async (data) => {
    setBusy(true);
    try {
      await eventService.update(id, data);
      toast('Event updated');
      navigate('/organizer/events');
    } catch (err) { toast(errorMessage(err), 'error'); } finally { setBusy(false); }
  };

  return (
    <div>
      <Link to="/organizer/events" className="inline-flex items-center gap-2 text-brand-500 text-sm mb-2"><ArrowLeft size={16} /> Back to Events</Link>
      <h1 className="text-3xl font-bold text-ink flex items-center gap-3"><Pencil /> Edit Event</h1>
      <p className="text-ink-muted mt-1 mb-6">Update the event details below.</p>
      <EventForm initial={event} onSubmit={save} submitting={busy} isEdit />
    </div>
  );
}
