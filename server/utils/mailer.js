// Sends email through the Resend HTTP API. Returns false when email is not configured.
export async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM || 'onboarding@resend.dev', to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text());
    return false;
  }
  return true;
}
