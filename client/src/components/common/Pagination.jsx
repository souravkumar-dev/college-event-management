import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-outline px-2 py-1.5"><ChevronLeft size={16} /></button>
      <span className="text-sm text-ink-muted">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-outline px-2 py-1.5"><ChevronRight size={16} /></button>
    </div>
  );
}
