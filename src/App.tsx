import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { CV_URL, EMAIL, LINKS, slugOf, useCollection, useHeroText, useHome } from './data';
import { Chips, Phone } from './ui';
import type { FeaturedPick, Project, Skill } from './types';
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const About = lazy(() => import('./pages/About'));
import Testimonials from './Testimonials';
const ProposalPage = lazy(() => import('./pages/Proposal'));
import { track } from './analytics';
const Admin = lazy(() => import('./admin/Admin'));

const HEADLINE = 'Android & KMP apps, built down to the last detail.';
const FALLBACK_SUB = 'Kotlin, Jetpack Compose and Kotlin Multiplatform: clean architecture underneath, polished motion on top.';

function useTheme(): [string, () => void] {
  const [t, setT] = useState(document.documentElement.dataset.theme || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* storage blocked */ }
  }, [t]);
  return [t, () => setT(x => (x === 'dark' ? 'light' : 'dark'))];
}

function Layout() {
  const [theme, toggle] = useTheme();
  return (
    <>
      <header className="nav"><div className="wrap">
        <Link className="logo" to="/" aria-label="Robert Romany, home">Robert<i>.</i>Romany</Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#work">Work</a><a href="/#stack">Stack</a><Link to="/about">About</Link><a href="/#contact">Contact</a>
          <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☾' : '☀'}</button>
          <a className="btn primary" href={CV_URL} target="_blank" rel="noreferrer" onClick={() => track('CV Download')}>Download CV</a>
        </nav>
      </div></header>
      <Outlet />
      <footer><div className="wrap"><span>© {new Date().getFullYear()} Robert Romany Elshahat</span><span>Tanta, Egypt · v10 · built {__BUILD__}</span></div></footer>
    </>
  );
}

function Hero() {
  const hero = useHeroText();
  const home = useHome();
  const { items: skills } = useCollection<Skill>('skills');
  return (
    <section className="hero" id="top"><div className="wrap">
      <div>
        <h1>{HEADLINE}</h1>
        <p className="lead">{home.subtitle || hero?.subtitle || FALLBACK_SUB}</p>
        <div className="cta">
          <a className="btn primary" href={CV_URL} target="_blank" rel="noreferrer" onClick={() => track('CV Download')}>Download CV</a>
          <a className="btn" href="#work">See my work</a>
          <a className="btn" href="#contact">Start a project</a>
        </div>
        <span className="avail"><b />Open to Android / KMP roles and freelance projects</span>
        {skills.length > 0 && <div className="strip">{skills.slice(0, 7).map(k => <i key={k.id} className={`${k.iconClass} colored`} role="img" aria-label={k.name} title={k.name} />)}</div>}
      </div>
      <Phone screens={home.phoneScreens || []} />
    </div></section>
  );
}

interface Entry { p: Project; f: FeaturedPick }
const imgProps = ({ p, f }: Entry) => ({
  src: f.image || p.cover || p.thumbnail,
  alt: p.title,
  style: { objectFit: f.fit || p.coverFit || 'cover', objectPosition: f.focus || p.coverFocus } as React.CSSProperties,
});

function Work() {
  const { items: projects, loading, error } = useCollection<Project>('projects', 'createdAt', 'desc');
  const home = useHome();
  const visible = projects.filter(p => !p.hidden);
  const picks = (home.featured || [])
    .map(f => { const p = visible.find(x => x.id === f.projectId || x.slug === f.projectId); return p ? { p, f } : null; })
    .filter((x): x is Entry => !!x);
  const used = new Set(picks.map(e => e.p.id));
  const ordered: Entry[] = [...picks, ...visible.filter(p => !used.has(p.id)).map(p => ({ p, f: { projectId: p.id } }))];
  const [lead, ...others] = ordered;
  return (
    <section id="work"><div className="wrap">
      <h2>Apps I have shipped and built</h2>
      {loading && <div className="skel" />}
      {error && <p className="err" role="alert">Could not load projects. Check your connection and refresh.</p>}
      {lead && (
        <Link className="feature" to={`/work/${slugOf(lead.p)}`}>
          <img {...imgProps(lead)} />
          <div className="body"><h3>{lead.p.title}</h3><p className="clamp">{lead.p.summary || lead.p.description}</p><Chips p={lead.p} n={6} /><span className="more">Read the case study</span></div>
        </Link>)}
      <div className="grid">
        {others.map(e => (
          <Link key={e.p.id} className="card" to={`/work/${slugOf(e.p)}`}>
            <img {...imgProps(e)} loading="lazy" />
            <div className="body"><h3>{e.p.title}</h3><p>{e.p.summary || e.p.description}</p><Chips p={e.p} /></div>
          </Link>))}
      </div>
    </div></section>
  );
}

function Stack() {
  const { items } = useCollection<Skill>('skills');
  if (!items.length) return null;
  return (
    <section id="stack"><div className="wrap">
      <h2>The tools I build with</h2>
      <div className="skills">{items.map(s => <div key={s.id} className="skill"><i className={`${s.iconClass} colored`} aria-hidden="true" />{s.name}</div>)}</div>
    </div></section>
  );
}

function Contact() {
  const [msg, setMsg] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setMsg('Email copied'); track('Copy Email'); } catch { setMsg('Copy failed, select the address manually'); }
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <section id="contact"><div className="wrap"><div className="contact">
      <h2>Hiring, or have an app in mind?</h2>
      <p>Send a short note about the role or the project. I reply within a day.</p>
      <div className="mail"><code>{EMAIL}</code>
        <button className="btn" onClick={copy}>Copy email</button>
        <a className="btn primary" href={`mailto:${EMAIL}`}>Write an email</a></div>
      <div className="status" role="status">{msg}</div>
      <div className="cta" style={{ marginBottom: 0 }}>
        <a className="btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn" href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></div>
    </div></div></section>
  );
}

const Home = () => <main><Hero /><Work /><Stack /><Testimonials /><Contact /></main>;

export default function App() {
  return (
    <Suspense fallback={null}><Routes>
      <Route path="/p/:id" element={<ProposalPage />} />
      <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="*" element={<main className="wrap page"><h1>Page not found</h1><Link className="btn" to="/">Back home</Link></main>} />
      </Route>
    </Routes></Suspense>
  );
}
