import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders Google's official sign-in button (Google Identity Services) and returns the ID token
export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    const render = () => {
      if (!window.google?.accounts?.id || !ref.current) return;
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (res) => onCredential(res.credential) });
      window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: ref.current.offsetWidth || 360, text: 'continue_with' });
    };
    if (window.google?.accounts?.id) { render(); return undefined; }
    let script = document.getElementById('google-gsi');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.id = 'google-gsi';
      document.body.appendChild(script);
    }
    script.addEventListener('load', render);
    script.addEventListener('error', () => setFailed(true));
    return () => script.removeEventListener('load', render);
  }, [onCredential]);

  if (!CLIENT_ID || failed) {
    return <p className="text-center text-xs text-ink-muted">Google sign-in is not available.</p>;
  }
  return <div ref={ref} className="w-full flex justify-center" />;
}
