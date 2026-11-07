import { useEffect, useState, type ReactNode } from 'react';
import type { Project, Screen } from './types';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
function Clock() {
  const [t, setT] = useState(fmt);
  useEffect(() => { const i = setInterval(() => setT(fmt()), 20000); return () => clearInterval(i); }, []);
  return <span>{t}</span>;
}

export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="phone" role="img" aria-label={label}>
      <div className="screen">
        <div className="sbar"><Clock /><span>5G <i className="batt" /></span></div>
        <i className="hole" />{children}<i className="pill" />
      </div>
    </div>
  );
}

/** Shows ONLY the screens you pass in. No screens = placeholder, never random images. */
export function Phone({ screens }: { screens: Screen[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (screens.length < 2 || reduced()) return;
    const id = setInterval(() => setI(x => (x + 1) % screens.length), 3800);
    return () => clearInterval(id);
  }, [screens.length]);
  const cur = screens[i];
  return (
    <div className="phone-col">
      <PhoneFrame label={cur?.caption || 'App preview'}>
        {screens.length === 0 && <div className="ph on">RR</div>}
        {screens.map((s, k) => <img key={s.url + k} src={s.url} alt="" className={k === i ? 'on' : ''} loading={k ? 'lazy' : 'eager'} />)}
      </PhoneFrame>
      <div className="cap" aria-live="polite">{cur?.caption}</div>
      {screens.length > 1 && (
        <div className="dots">{screens.map((_, k) =>
          <button key={k} onClick={() => setI(k)} aria-label={`Show screen ${k + 1}`} aria-current={k === i} />)}
        </div>)}
    </div>
  );
}

export const Chips = ({ p, n = 4 }: { p: Project; n?: number }) => (
  <div className="chips">
    {(p.platforms || []).map(x => <span key={x} className="chip plat">{String(x).toUpperCase()}</span>)}
    {(p.technologies || []).slice(0, n).map(x => <span key={x} className="chip">{x}</span>)}
  </div>
);
