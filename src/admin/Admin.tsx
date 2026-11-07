import { useEffect, useState, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore/lite';
import { app, db } from '../firebase';
import { clearCache, useCollection } from '../data';
import { Field } from './fields';
import { Proposals } from './Proposals';
import { Journey, Principles, Reviews } from './Extra';
import type { FeaturedPick, HomeContent, Project, Screen } from '../types';

const auth = getAuth(app);
const move = <T,>(a: T[], i: number, d: number) => { const b = [...a], j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };

const Save = ({ onClick, msg }: { onClick: () => void; msg: string }) => (
  <div className="savebar"><button className="btn primary" onClick={onClick}>Save</button><span role="status">{msg}</span></div>
);

function Login() {
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const go = async () => { try { await signInWithEmailAndPassword(auth, e, p); } catch { setErr('Wrong email or password'); } };
  return (
    <div className="adm narrow"><h1>Admin</h1>
      <Field label="Email" value={e} onChange={setE} />
      <label className="fld"><span>Password</span><input type="password" value={p} onChange={x => setP(x.target.value)} onKeyDown={k => k.key === 'Enter' && go()} /></label>
      <button className="btn primary" onClick={go}>Sign in</button><p className="err" role="alert">{err}</p>
    </div>
  );
}

function Homepage({ projects }: { projects: Project[] }) {
  const [h, setH] = useState<HomeContent>({ phoneScreens: [], featured: [] }); const [msg, setMsg] = useState('');
  useEffect(() => { getDoc(doc(db, 'site_content', 'home')).then(s => s.exists() && setH(s.data() as HomeContent)); }, []);
  const ps = h.phoneScreens || [], fe = h.featured || [];
  const setPs = (v: Screen[]) => setH({ ...h, phoneScreens: v }), setFe = (v: FeaturedPick[]) => setH({ ...h, featured: v });
  const save = async () => {
    const clean: HomeContent = { subtitle: h.subtitle || '', phoneScreens: ps.filter(s => s.url.trim()), featured: fe.filter(f => f.projectId) };
    try { await setDoc(doc(db, 'site_content', 'home'), clean); clearCache(); setMsg('Saved'); } catch { setMsg('Save failed (are you signed in?)'); }
  };
  const Row = ({ children, i, n, set, arr }: { children: ReactNode; i: number; n: number; set: (v: never[]) => void; arr: unknown[] }) => (
    <div className="item">{children}<div className="ctl">
      <button aria-label="Move up" disabled={i === 0} onClick={() => set(move(arr, i, -1) as never[])}>↑</button>
      <button aria-label="Move down" disabled={i === n - 1} onClick={() => set(move(arr, i, 1) as never[])}>↓</button>
      <button aria-label="Remove" onClick={() => set(arr.filter((_, k) => k !== i) as never[])}>✕</button></div></div>
  );
  return (
    <div>
      <Field label="Hero subtitle (optional)" value={h.subtitle || ''} onChange={v => setH({ ...h, subtitle: v })} area />
      <h2>Phone screens</h2><p className="muted">Exactly these images, in this order, are shown in the phone frame.</p>
      {ps.map((s, i) => (
        <Row key={i} i={i} n={ps.length} arr={ps} set={setPs as never}>
          {s.url && <img className="thumb tall" src={s.url} alt="" />}
          <div className="grow"><Field label="Image URL" value={s.url} onChange={v => setPs(ps.map((x, k) => k === i ? { ...x, url: v } : x))} />
            <Field label="Caption" value={s.caption || ''} onChange={v => setPs(ps.map((x, k) => k === i ? { ...x, caption: v } : x))} /></div>
        </Row>))}
      <button className="btn" onClick={() => setPs([...ps, { url: '' }])}>+ Add screen</button>
      <h2>Featured projects</h2><p className="muted">The first one is the big hero project. Image can be any shape.</p>
      {fe.map((f, i) => (
        <Row key={i} i={i} n={fe.length} arr={fe} set={setFe as never}>
          {f.image && <img className="thumb" src={f.image} alt="" style={{ objectFit: f.fit || 'cover', objectPosition: f.focus }} />}
          <div className="grow">
            <label className="fld"><span>Project</span>
              <select value={f.projectId} onChange={e => setFe(fe.map((x, k) => k === i ? { ...x, projectId: e.target.value } : x))}>
                <option value="">Choose…</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
            <Field label="Image URL (empty = project cover)" value={f.image || ''} onChange={v => setFe(fe.map((x, k) => k === i ? { ...x, image: v } : x))} />
            <div className="two">
              <label className="fld"><span>Fit</span>
                <select value={f.fit || 'cover'} onChange={e => setFe(fe.map((x, k) => k === i ? { ...x, fit: e.target.value as 'cover' | 'contain' } : x))}>
                  <option value="cover">cover (fill)</option><option value="contain">contain (whole image)</option></select></label>
              <Field label="Focus" value={f.focus || ''} onChange={v => setFe(fe.map((x, k) => k === i ? { ...x, focus: v } : x))} hint="e.g. top, center 20%" /></div>
          </div>
        </Row>))}
      <button className="btn" onClick={() => setFe([...fe, { projectId: '' }])}>+ Add featured project</button>
      <Save onClick={save} msg={msg} />
    </div>
  );
}

const TEXT: [keyof Project, string, boolean?][] = [
  ['title', 'Title'], ['slug', 'Slug (URL name)'], ['summary', 'Short summary for cards (1-2 sentences)', true], ['description', 'Full description (case study page)', true], ['thumbnail', 'Thumbnail URL'],
  ['cover', 'Cover image URL (any aspect ratio)'], ['coverFocus', 'Cover focus (e.g. top)'], ['liveLink', 'Live / Play Store link'],
  ['sourceLink', 'Source code link'], ['role', 'My role', true], ['why', 'Why these technical choices', true], ['architecture', 'Architecture diagram image'], ['video', 'Demo video URL (mp4/webm)'], ['problem', 'The problem', true], ['result', 'The result', true],
];
const list = (s: string, sep: RegExp) => s.split(sep).map(x => x.trim()).filter(Boolean);

function ProjectEditor({ p, onDone }: { p: Project | null; onDone: () => void }) {
  const init = () => ({ ...Object.fromEntries(TEXT.map(([k]) => [k, String(p?.[k] ?? '')])), coverFit: p?.coverFit || 'cover', hidden: p?.hidden ? '1' : '',
    platforms: (p?.platforms || []).join(', '), technologies: (p?.technologies || []).join(', '), screens: (p?.screens || []).join('\n') });
  const [d, setD] = useState<Record<string, string>>(init); const [msg, setMsg] = useState('');
  useEffect(() => { setD(init()); setMsg(''); }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: string) => (v: string) => setD(x => ({ ...x, [k]: v }));
  const save = async () => {
    if (!d.title.trim()) return setMsg('Title is required');
    const data: Record<string, unknown> = {}; const empty = () => (p ? deleteField() : undefined);
    for (const [k] of TEXT) data[k] = d[k].trim() || empty();
    data.coverFit = d.coverFit;
    data.hidden = d.hidden ? true : empty();
    for (const [k, v] of [['platforms', list(d.platforms, /,/)], ['technologies', list(d.technologies, /,/)], ['screens', list(d.screens, /\n/)]] as const) data[k] = v.length ? v : empty();
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    try {
      if (p) await updateDoc(doc(db, 'projects', p.id), data); else await addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() });
      setMsg('Saved'); onDone();
    } catch { setMsg('Save failed (are you signed in?)'); }
  };
  const del = async () => { if (p && confirm(`Delete "${p.title}"?`)) { await deleteDoc(doc(db, 'projects', p.id)); onDone(); } };
  return (
    <div className="editor">
      {TEXT.map(([k, l, a]) => <Field key={k} label={l} value={d[k]} onChange={set(k)} area={a} />)}
      <label className="fld"><span>Cover fit</span><select value={d.coverFit} onChange={e => set('coverFit')(e.target.value)}><option value="cover">cover (fill)</option><option value="contain">contain (whole image)</option></select></label>
      <label className="chk"><input type="checkbox" checked={d.hidden === '1'} onChange={e => set('hidden')(e.target.checked ? '1' : '')} /> Hide this project from the site</label>
      <Field label="Platforms" value={d.platforms} onChange={set('platforms')} hint="comma separated, e.g. android, ios" />
      <Field label="Technologies" value={d.technologies} onChange={set('technologies')} hint="comma separated" />
      <Field label="Phone screenshots" value={d.screens} onChange={set('screens')} area hint="one image URL per line, in the order you want" />
      <div className="savebar"><button className="btn primary" onClick={save}>Save</button>{p && <button className="btn" onClick={del}>Delete</button>}<span role="status">{msg}</span></div>
    </div>
  );
}

function Projects({ projects, onDone }: { projects: Project[]; onDone: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const cur = projects.find(p => p.id === sel) || null;
  return (
    <div className="split"><aside>
      <button className="btn" onClick={() => setSel('')}>+ New project</button>
      {projects.map(p => <button key={p.id} className={`li${p.id === sel ? ' on' : ''}`} onClick={() => setSel(p.id)}>{p.title}</button>)}
    </aside>{sel !== null ? <ProjectEditor p={cur} onDone={onDone} /> : <p className="muted">Pick a project or create one.</p>}</div>
  );
}

function Panel({ user }: { user: User }) {
  const [tab, setTab] = useState<'home' | 'projects' | 'journey' | 'principles' | 'proposals' | 'reviews'>('home'); const [rev, setRev] = useState(0);
  const { items } = useCollection<Project>('projects', 'createdAt', 'desc', rev);
  return (
    <div className="adm">
      <div className="top"><h1>Admin</h1><span className="muted">{user.email}</span><button className="btn" onClick={() => signOut(auth)}>Sign out</button></div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'home'} onClick={() => setTab('home')}>Homepage</button>
        <button role="tab" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>Projects</button>
        <button role="tab" aria-selected={tab === 'journey'} onClick={() => setTab('journey')}>Journey</button>
        <button role="tab" aria-selected={tab === 'principles'} onClick={() => setTab('principles')}>Principles</button>
        <button role="tab" aria-selected={tab === 'proposals'} onClick={() => setTab('proposals')}>Proposals</button>
        <button role="tab" aria-selected={tab === 'reviews'} onClick={() => setTab('reviews')}>Reviews</button></div>
      {tab === 'proposals' ? <Proposals /> : tab === 'principles' ? <Principles /> : tab === 'journey' ? <Journey /> : tab === 'reviews' ? <Reviews /> : tab === 'home' ? <Homepage key={rev} projects={items} /> : <Projects projects={items} onDone={() => { clearCache(); setRev(r => r + 1); }} />}
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.append(m);
    const off = onAuthStateChanged(auth, setUser);
    return () => { off(); m.remove(); };
  }, []);
  if (user === undefined) return <div className="adm narrow"><div className="skel" /></div>;
  return user ? <Panel user={user} /> : <Login />;
}
