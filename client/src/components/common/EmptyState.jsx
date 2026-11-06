import { Inbox } from 'lucide-react';

export default function EmptyState({ title, text, action }) {
  return (
    <div className="card p-10 text-center">
      <Inbox className="mx-auto text-slate-300" size={40} />
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {text && <p className="text-sm text-ink-muted mt-1">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
