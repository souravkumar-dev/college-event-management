const COLORS = ['#0866F5', '#16B978', '#7c3aed', '#F5A623', '#EF4444', '#60758F'];

export default function CategoryChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="text-sm text-ink-muted py-10 text-center">No registrations yet.</p>;
  let start = 0;
  const stops = data.map((d, i) => {
    const end = start + (d.count / total) * 100;
    const s = `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
    start = end;
    return s;
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 rounded-full shrink-0" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink">{total}</span>
          <span className="text-xs text-ink-muted">Total</span>
        </div>
      </div>
      <ul className="space-y-3 text-sm w-full">
        {data.map((d, i) => (
          <li key={d.category} className="flex justify-between gap-4">
            <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.category}</span>
            <span className="text-ink-muted">{d.count} ({((d.count / total) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
