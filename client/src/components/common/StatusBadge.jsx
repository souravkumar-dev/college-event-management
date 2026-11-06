const styles = {
  confirmed: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  upcoming: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-slate-200 text-slate-600',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[key] || 'bg-slate-100 text-slate-600'}`}>
      {key}
    </span>
  );
}

export const CategoryBadge = ({ category }) => (
  <span className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">{category}</span>
);
