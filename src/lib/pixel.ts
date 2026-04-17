export const initPixel = (pixelId: string) => {
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
  w.fbq('init', pixelId);
  w.fbq('track', 'PageView');
};

export const trackEvent = (eventName: string, params?: object) => {
  if (typeof window === 'undefined' || !(window as any).fbq) return;
  if (params) (window as any).fbq('track', eventName, params);
  else (window as any).fbq('track', eventName);
};
