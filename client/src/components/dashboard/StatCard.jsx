import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function StatCard({ icon: Icon, color, label, value, to, linkText }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}><Icon size={22} /></div>
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
      {to && <Link to={to} className="inline-flex items-center gap-1 mt-3 text-sm text-brand-500">{linkText} <ArrowRight size={14} /></Link>}
    </div>
  );
}
