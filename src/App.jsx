import { useEffect, useState } from 'react';
import { useCollection, useDocument, CV_URL, EMAIL, LINKS } from './data';

const HEADLINE = 'Android & KMP apps, built down to the last detail.';
const FALLBACK_SUB = 'Kotlin, Jetpack Compose and Kotlin Multiplatform: clean architecture underneath, polished motion on top.';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useTheme() {
  const [t, setT] = useState(document.documentElement.dataset.theme || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch {}
  }, [t]);
  return [t, () => setT(x => (x === 'dark' ? 'light' : 'dark'))];
}

function Nav({ theme, toggle }) {
  return (
    <header className="nav"><div className="wrap">
      <a className="logo" href="#top" aria-label="Robert Romany, home">Robert<i>.</i>Romany</a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#work">Work</a><a href="#stack">Stack</a><a href="#contact">Contact</a>
        <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? '☾' : '☀'}
        </button>
        <a className="btn primary" href={CV_URL} target="_blank" rel="noreferrer">Download CV</a>
      </nav>
    </div></header>
  );
}

function Clock() {
  const fmt = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  const [t, setT] = useState(fmt);
  useEffect(() => { const i = setInterval(() => setT(fmt()), 20000); return () => clearInterval(i); }, []);
  return <span>{t}</span>;
}

function Phone({ projects }) {
  const shots = projects.filter(p => p.thumbnail).slice(0, 6);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (shots.length < 2 || reduced()) return;
    const id = setInterval(() => setI(x => (x + 1) % shots.length), 3800);
    return () => clearInterval(id);
  }, [shots.length]);
  const cur = shots[i];
  return (
    <div className="phone-col">
      <div className="phone" role="img" aria-label={cur ? `Screenshot of ${cur.title}` : 'App preview'}>
        <div className="screen">
          <div className="sbar"><Clock /><span>5G <i className="batt" /></span></div>
          <i className="hole" />
          {shots.length === 0 && <div className="ph on">RR</div>}
          {shots.map((p, k) => <img key={p.id} src={p.thumbnail} alt="" className={k === i ? 'on' : ''} loading={k ? 'lazy' : 'eager'} />)}
          <i className="pill" />
        </div>
      </div>
      <div className="cap" aria-live="polite">{cur?.title}</div>
      {shots.length > 1 && (
        <div className="dots">{shots.map((p, k) =>
          <button key={p.id} onClick={() => setI(k)} aria-label={`Show ${p.title}`} aria-current={k === i} />)}
        </div>)}
    </div>
  );
}

function Hero({ projects }) {
  const hero = useDocument('site_content', 'hero');
  return (
    <section className="hero" id="top"><div className="wrap">
      <div>
        <h1>{HEADLINE}</h1>
        <p className="lead">{hero?.subtitle || FALLBACK_SUB}</p>
        <div className="cta">
          <a className="btn primary" href={CV_URL} target="_blank" rel="noreferrer">Download CV</a>
          <a className="btn" href="#work">See my work</a>
          <a className="btn" href="#contact">Start a project</a>
        </div>
        <span className="avail"><b />Open to Android / KMP roles and freelance projects</span>
      </div>
      <Phone projects={projects} />
    </div></section>
  );
}

const Chips = ({ p, n = 4 }) => (
  <div className="chips">
    {(p.platforms || []).map(x => <span key={x} className="chip plat">{String(x).toUpperCase()}</span>)}
    {(p.technologies || []).slice(0, n).map(x => <span key={x} className="chip">{x}</span>)}
  </div>
);
const href = p => p.liveLink || p.sourceLink || undefined;

function Work({ projects, loading }) {
  const [first, ...rest] = projects;
  return (
    <section id="work"><div className="wrap">
      <h2>Apps I have shipped and built</h2>
      {loading && <div className="skel" />}
      {first && (
        <a className="feature" href={href(first)} target="_blank" rel="noreferrer">
          <img src={first.thumbnail} alt={first.title} />
          <div className="body"><h3>{first.title}</h3><p>{first.description}</p><Chips p={first} n={6} /></div>
        </a>)}
      <div className="grid">
        {rest.map(p => (
          <a key={p.id} className="card" href={href(p)} target="_blank" rel="noreferrer">
            <img src={p.thumbnail} alt={p.title} loading="lazy" />
            <div className="body"><h3>{p.title}</h3><p>{p.description}</p><Chips p={p} /></div>
          </a>))}
      </div>
    </div></section>
  );
}

function Stack() {
  const { items } = useCollection('skills');
  if (!items.length) return null;
  return (
    <section id="stack"><div className="wrap">
      <h2>The tools I build with</h2>
      <div className="skills">
        {items.map(s => <div key={s.id} className="skill"><i className={`${s.iconClass} colored`} aria-hidden="true" />{s.name}</div>)}
      </div>
    </div></section>
  );
}

function Contact() {
  const [msg, setMsg] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setMsg('Email copied'); }
    catch { setMsg('Copy failed, select the address manually'); }
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <section id="contact"><div className="wrap"><div className="contact">
      <h2>Hiring, or have an app in mind?</h2>
      <p>Send a short note about the role or the project. I reply within a day.</p>
      <div className="mail">
        <code>{EMAIL}</code>
        <button className="btn" onClick={copy}>Copy email</button>
        <a className="btn primary" href={`mailto:${EMAIL}`}>Write an email</a>
      </div>
      <div className="status" role="status">{msg}</div>
      <div className="cta" style={{ marginBottom: 0 }}>
        <a className="btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn" href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </div></div></section>
  );
}

export default function App() {
  const [theme, toggle] = useTheme();
  const { items: projects, loading } = useCollection('projects', 'createdAt', 'desc');
  return (
    <>
      <Nav theme={theme} toggle={toggle} />
      <main>
        <Hero projects={projects} />
        <Work projects={projects} loading={loading} />
        <Stack />
        <Contact />
      </main>
      <footer><div className="wrap"><span>© {new Date().getFullYear()} Robert Romany Elshahat</span><span>Tanta, Egypt</span></div></footer>
    </>
  );
}
