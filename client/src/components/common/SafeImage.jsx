import { useState } from 'react';

// Shows a fallback picture if an online image URL fails to load
const FALLBACK = 'https://picsum.photos/seed/college-event/800/450';

export default function SafeImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => !failed && setFailed(true)}
    />
  );
}
