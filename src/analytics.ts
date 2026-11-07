// Plausible: cookieless, so no consent banner. Set VITE_PLAUSIBLE_DOMAIN (e.g. robertromany.github.io) to enable; otherwise it is a no-op.
declare global { interface Window { plausible?: (event: string) => void } }
export function initAnalytics() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (!domain || location.hostname === 'localhost') return;
  const s = document.createElement('script');
  s.defer = true; s.dataset.domain = domain; s.src = 'https://plausible.io/js/script.js';
  document.head.append(s);
}
export const track = (event: string) => window.plausible?.(event);
