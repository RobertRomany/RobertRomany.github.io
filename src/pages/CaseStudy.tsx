import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LINKS, slugOf, useCollection } from '../data';
import { Chips } from '../ui';
import Gallery from '../Gallery';
import { youtubeId } from '../video';
import type { Project } from '../types';

export default function CaseStudy() {
  const { slug } = useParams();
  const { items, loading } = useCollection<Project>('projects', 'createdAt', 'desc');
  const i = items.findIndex(p => slugOf(p) === slug);
  const p = items[i];
  const shown = items.filter(x => !x.hidden);
  const k = shown.findIndex(x => x.id === p?.id);
  const next = shown.length > 1 && k >= 0 ? shown[(k + 1) % shown.length] : null;
  useEffect(() => { window.scrollTo(0, 0); document.title = p ? `${p.title} | Robert Romany` : 'Robert Romany'; }, [p]);

  if (loading) return <main className="wrap page"><div className="skel" /></main>;
  if (!p) return <main className="wrap page"><h1>Project not found</h1><Link className="btn" to="/#work">Back to work</Link></main>;

  const cover = p.cover || p.thumbnail;
  const facts = [['My role', p.role], ['The problem', p.problem], ['The result', p.result]].filter(([, v]) => v);
  return (
    <main className="wrap page">
      <Link className="back" to="/#work">← All work</Link>
      <h1>{p.title}</h1>
      <Chips p={p} n={10} />
      {cover && <img className="banner" src={cover} alt={p.title} style={{ objectFit: p.coverFit || 'cover', objectPosition: p.coverFocus }} />}
      <div className="case">
        <p className="lead prewrap">{p.description}</p>
        {facts.length > 0 && <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
      </div>
      {p.why && <section className="sect"><h2>Why these choices</h2><p>{p.why}</p></section>}
      {p.architecture && <section className="sect"><h2>Architecture</h2><img className="banner" src={p.architecture} alt={`${p.title} architecture diagram`} style={{ objectFit: 'contain' }} loading="lazy" /></section>}
      {p.video && (
        <section className="sect"><h2>Demo</h2>
          {youtubeId(p.video)
            ? <div className="yt"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId(p.video)}`} title={`${p.title} demo`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
            : <video className="banner" src={p.video} controls playsInline preload="metadata" />}
        </section>)}
      <div className="cta">
        {p.liveLink && <a className="btn primary" href={p.liveLink} target="_blank" rel="noreferrer">Open the app</a>}
        {p.sourceLink && <a className="btn" href={p.sourceLink} target="_blank" rel="noreferrer">Source code</a>}
        <a className="btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">Talk to me</a>
      </div>
      {p.screens && p.screens.length > 0 && <Gallery screens={p.screens} title={p.title} />}
      {next && <Link className="next" to={`/work/${slugOf(next)}`}><span>Next project</span><b>{next.title}</b></Link>}
    </main>
  );
}