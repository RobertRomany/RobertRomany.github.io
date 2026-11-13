import { useCallback, useEffect, useRef, useState } from 'react';
import { PhoneFrame } from './ui';

const Chevron = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={dir === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** Phone screenshots: drag with the mouse, swipe on touch, arrow buttons or ←/→ keys move one screen at a time. */
export default function Gallery({ screens, title }: { screens: string[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState({ prev: false, next: screens.length > 1 });

  const update = useCallback(() => {
    const el = track.current; if (!el) return;
    setEdge({ prev: el.scrollLeft > 4, next: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 });
  }, []);
  useEffect(() => { update(); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }, [update, screens.length]);

  const behavior = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const goTo = (i: number) => {
    const el = track.current; const c = el?.children[i] as HTMLElement | undefined; if (!el || !c) return;
    el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: behavior() });
  };
  const nearest = () => {
    const el = track.current; if (!el) return 0;
    const mid = el.scrollLeft + el.clientWidth / 2; let best = 0, gap = Infinity;
    Array.from(el.children).forEach((c, i) => { const h = c as HTMLElement; const g = Math.abs(h.offsetLeft + h.offsetWidth / 2 - mid); if (g < gap) { gap = g; best = i; } });
    return best;
  };
  const step = (dir: 1 | -1) => goTo(Math.min(screens.length - 1, Math.max(0, nearest() + dir)));

  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track.current) return; // touch and pen scroll natively
    drag.current = { x: e.clientX, left: track.current.scrollLeft }; setDragging(true); track.current.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => { if (drag.current && track.current) track.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const up = () => { if (!drag.current) return; drag.current = null; setDragging(false); goTo(nearest()); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  return (
    <div className="gal">
      {screens.length > 1 && <button className="gal-btn prev" aria-label="Previous screen" disabled={!edge.prev} onClick={() => step(-1)}><Chevron dir="l" /></button>}
      <div ref={track} className={`gallery${dragging ? ' dragging' : ''}`} role="region" aria-label={`${title} screens`} tabIndex={0}
        onScroll={update} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {screens.map((u, k) => (
          <PhoneFrame key={u + k} label={`${title} screen ${k + 1} of ${screens.length}`}><img className="on" src={u} alt="" draggable={false} loading="lazy" /></PhoneFrame>
        ))}
      </div>
      {screens.length > 1 && <button className="gal-btn next" aria-label="Next screen" disabled={!edge.next} onClick={() => step(1)}><Chevron dir="r" /></button>}
    </div>
  );
}
