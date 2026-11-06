export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-muted">
      <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      {text}
    </div>
  );
}
