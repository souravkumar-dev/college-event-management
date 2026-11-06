import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Upload, Star, GripVertical, X, Plus, Info, Save, Users, MapPin, Clock } from 'lucide-react';
import { CATEGORIES, eventService } from '../../services/eventService.js';
import { errorMessage } from '../../services/api.js';
import { toInputDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const EVENT_TYPES = ['Offline', 'Online', 'Hybrid'];

const empty = {
  eventName: '', category: '', eventType: '', date: '', time: '', venue: '', maxParticipants: '',
  registrationDeadline: '', description: '', image: '', highlights: ['', '', ''], gallery: '', tagline: '', organizerName: '', department: '', contactEmail: '', contactPhone: '', status: 'Upcoming',
};

export default function EventForm({ initial, onSubmit, submitting, isEdit }) {
  const toast = useToast();
  const [form, setForm] = useState(() => (initial ? {
    ...empty, ...initial,
    date: toInputDate(initial.date), registrationDeadline: toInputDate(initial.registrationDeadline),
    highlights: initial.highlights?.length ? initial.highlights : [''],
    gallery: (initial.gallery || []).join('\n'),
    status: initial.status === 'Cancelled' ? 'Cancelled' : 'Upcoming',
  } : empty));
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setHl = (i, v) => setForm({ ...form, highlights: form.highlights.map((h, idx) => (idx === i ? v : h)) });

  const onFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('Image must be under 5MB', 'error');
    setUploading(true);
    try {
      const url = await eventService.uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.image) return toast('Please upload an event image', 'error');
    if (form.registrationDeadline > form.date) return toast('Registration deadline must be on or before the event date', 'error');
    onSubmit({
      ...form,
      maxParticipants: Number(form.maxParticipants),
      highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
      gallery: form.gallery.split(/\s+/).map((g) => g.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="card p-6">
        <h2 className="font-semibold text-ink flex items-center gap-2 mb-5"><CalendarPlus size={18} /> Event Details</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label className="label">Event Name *</label><input required value={form.eventName} onChange={set('eventName')} placeholder="Enter event name" className="input" /></div>
          <div><label className="label">Category *</label>
            <select required value={form.category} onChange={set('category')} className="input">
              <option value="">Select category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Date *</label><input required type="date" value={form.date} onChange={set('date')} className="input" /></div>
          <div><label className="label">Time *</label>
            <div className="relative"><Clock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input required value={form.time} onChange={set('time')} placeholder="e.g. 09:00 AM - 05:00 PM" className="input pl-9" /></div></div>
          <div><label className="label">Venue *</label>
            <div className="relative"><MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              <input required value={form.venue} onChange={set('venue')} placeholder="Enter venue / location" className="input pl-9" /></div></div>
          <div><label className="label">Event Type *</label>
            <select required value={form.eventType} onChange={set('eventType')} className="input">
              <option value="">Select event type</option>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div><label className="label">Max Participants *</label>
            <div className="relative"><Users size={16} className="absolute left-3 top-3 text-slate-400" />
              <input required type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')} placeholder="Enter maximum number" className="input pl-9" /></div></div>
          <div><label className="label">Registration Deadline *</label><input required type="date" value={form.registrationDeadline} onChange={set('registrationDeadline')} className="input" /></div>
          {isEdit && (
            <div><label className="label">Status</label>
              <select value={form.status} onChange={set('status')} className="input">
                <option value="Upcoming">Scheduled (status from dates)</option><option value="Cancelled">Cancelled</option>
              </select></div>
          )}
          <div><label className="label">Organizer / Committee</label><input value={form.organizerName} onChange={set('organizerName')} placeholder="e.g. Cultural Committee" className="input" /></div>
          <div><label className="label">Department</label><input value={form.department} onChange={set('department')} placeholder="e.g. Student Affairs" className="input" /></div>
          <div><label className="label">Contact Email</label><input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="name@college.edu.in" className="input" /></div>
          <div><label className="label">Contact Phone</label><input value={form.contactPhone} onChange={set('contactPhone')} placeholder="+91 ..." className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Tagline (optional)</label><input value={form.tagline} onChange={set('tagline')} placeholder="e.g. Be Creative | Be Confident" className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Description *</label>
            <textarea required rows={5} value={form.description} onChange={set('description')} placeholder="Enter event description..." className="input" /></div>
        </div>
        <div className="mt-5 bg-brand-50 text-brand-600 text-sm rounded-md p-3 flex gap-2"><Info size={16} /> Make sure all details are correct before publishing the event.</div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4"><Upload size={18} className="text-brand-500" /> Event Image *</h2>
          <div className="grid grid-cols-2 gap-4">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed border-brand-100 bg-brand-50 rounded-lg h-44 flex flex-col items-center justify-center text-center text-sm text-ink-muted cursor-pointer px-2">
              <Upload size={28} className="text-brand-500 mb-2" />
              {uploading ? 'Uploading...' : 'Click to upload image'}
              <span className="text-xs text-slate-400">or drag and drop (JPG, PNG · Max 5MB)</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
            </label>
            <div className="h-44 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-xs text-slate-400">
              {form.image ? <img src={form.image} alt="Event" className="w-full h-full object-cover" /> : 'No image yet'}
            </div>
          </div>
          <label className="label mt-4">Or paste an online image URL</label>
          <input type="url" value={form.image} onChange={set('image')} placeholder="https://..." className="input" />
          <label className="label mt-4">Gallery image URLs (one per line, optional)</label>
          <textarea rows={3} value={form.gallery} onChange={set('gallery')} placeholder={'https://...\nhttps://...'} className="input" />
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2"><Star size={18} className="text-brand-500" /> Event Highlights</h2>
          <p className="text-sm text-ink-muted mb-4">Add key features or highlights of your event.</p>
          <div className="space-y-3">
            {form.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={16} className="text-slate-400" />
                <input value={h} onChange={(e) => setHl(i, e.target.value)} placeholder="Enter highlight point..." className="input" />
                <button type="button" onClick={() => setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) })} className="text-danger"><X size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setForm({ ...form, highlights: [...form.highlights, ''] })} className="btn-primary mt-4"><Plus size={16} /> Add More</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/organizer/events" className="btn-outline"><X size={16} /> Cancel</Link>
          <button type="submit" disabled={submitting || uploading} className="btn-primary"><Save size={16} /> {submitting ? 'Saving...' : 'Save Event'}</button>
        </div>
      </div>
    </form>
  );
}
