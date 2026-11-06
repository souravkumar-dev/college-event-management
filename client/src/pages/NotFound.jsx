import { Link } from 'react-router-dom';

export default function NotFound({ title = 'Page not found', text = "The page you're looking for doesn't exist." }) {
  return (
    <div className="max-w-md mx-auto text-center px-4 py-24">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="text-2xl font-bold text-ink mt-4">{title}</h1>
      <p className="text-ink-muted mt-2">{text}</p>
      <Link to="/events" className="btn-primary mt-6">Browse events</Link>
    </div>
  );
}
