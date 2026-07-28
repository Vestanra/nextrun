export interface FmtDate {
  day: string;
  mon: string;
  full: string;
}

export function fmtDate(iso: string): FmtDate {
  const d = new Date(iso + 'T00:00:00');
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    full:
      d.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' (' +
      d.toLocaleString('en-US', { weekday: 'short' }) +
      ')',
  };
}
