const PIXEL_ID = '1335892905133004';

export const initPixel = () => {
  if (typeof window === 'undefined' || (window as any).fbq) return;
  const w = window as any;
  const n = (w.fbq = function (...a: unknown[]) {
    n.callMethod ? n.callMethod(...a) : n.queue.push(a);
  });
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(t);
  w.fbq('init', PIXEL_ID);
  w.fbq('track', 'PageView');
};

export const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq(...args);
  }
};
