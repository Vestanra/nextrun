const Icon = {
  // from components.jsx
  search:   (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  pin:      (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" /></svg>,
  flag:     (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 21V4m0 0 9 1.5L19 4v9l-5 1.5L5 13" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>,
  arrow:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  phone:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  mail:     (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" /></svg>,
  // from screens.jsx
  back:     (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chevron:  (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  cal:      (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  route:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 19V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.7" /><circle cx="18" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.7" /></svg>,
  alert:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check:    (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  download: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

export default Icon;
