export const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const dayMonth = (d) => {
  if (!d) return { day: '--', month: '' };
  const date = new Date(d);
  if (isNaN(date.getTime())) return { day: '--', month: '' };
  return { day: String(date.getDate()).padStart(2, '0'), month: date.toLocaleDateString('en-GB', { month: 'short' }) };
};

export const toInputDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};
export const DEPARTMENTS = ['MCA', 'BCA', 'B.Tech CSE', 'B.Tech ECE', 'B.Tech EEE', 'MBA', 'Other'];
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
