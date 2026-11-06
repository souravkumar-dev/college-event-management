export default function EventChart({ data }) {
  if (!data.length) return <p className="text-sm text-ink-muted py-10 text-center">No events yet.</p>;
  const max = Math.max(1, ...data.map((d) => d.registrations));
  return (
    <div>
      <div className="flex items-end gap-4 h-56 border-b border-slate-200 px-2">
        {data.map((d) => (
          <div key={d.eventName} className="flex-1 flex items-end justify-center gap-1.5 h-full" title={`${d.registrations} registrations, ${d.pending} pending`}>
            <div className="w-6 bg-brand-500 rounded-t" style={{ height: `${(d.registrations / max) * 100}%` }} />
            <div className="w-4 bg-sky-300 rounded-t" style={{ height: `${(d.pending / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-4 px-2 mt-2 text-xs text-ink-muted">
        {data.map((d) => <span key={d.eventName} className="flex-1 text-center truncate">{d.eventName}</span>)}
      </div>
    </div>
  );
}
