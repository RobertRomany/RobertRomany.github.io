import { useEffect } from 'react';
import { track } from '../analytics';
import { CV_URL, useCollection } from '../data';
import type { Principle, TimelineItem } from '../types';

export default function About() {
  const { items, loading } = useCollection<TimelineItem>('timeline', 'createdAt', 'asc');
  const { items: principles } = useCollection<Principle>('principles', 'createdAt', 'asc');
  useEffect(() => { window.scrollTo(0, 0); document.title = 'About | Robert Romany'; }, []);
  return (
    <main className="wrap page">
      <h1>How I work</h1>
      {principles.length > 0 && (
        <ol className="pr">{principles.map((p, i) => (
          <li key={p.id}><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div><h3>{p.title}</h3>{p.description && <p>{p.description}</p>}</div></li>))}</ol>)}
      <h2 className="jh">My journey</h2>
      <p className="lead">Where I studied, led, and shipped, in the order it happened.</p>
      {loading && <div className="skel" />}
      <ol className="tl">
        {items.map(t => (
          <li key={t.id}>
            <span className="yr">{t.year || t.date}</span>
            <div><h3>{t.role || t.title}</h3>{t.company && <p className="co">{t.company}</p>}
              {(t.desc || t.description) && <p>{t.desc || t.description}</p>}
              {t.tags && t.tags.length > 0 && <div className="chips">{t.tags.map(x => <span key={x} className="chip">{x}</span>)}</div>}</div>
          </li>))}
      </ol>
      <a className="btn primary" href={CV_URL} target="_blank" rel="noreferrer" onClick={() => track('CV Download')}>Download the full CV</a>
    </main>
  );
}
