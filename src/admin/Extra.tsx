import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore/lite';
import { db } from '../firebase';
import { clearCache } from '../data';
import { Field } from './fields';
import type { Principle, Testimonial, TimelineItem } from '../types';

const blank = { year: '', role: '', company: '', desc: '', tags: '' };
export function Journey() {
  const [items, setItems] = useState<TimelineItem[]>([]); const [sel, setSel] = useState<string | null>(null);
  const [d, setD] = useState(blank); const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const s = await getDocs(query(collection(db, 'timeline'), orderBy('createdAt', 'asc'))).catch(() => getDocs(collection(db, 'timeline')));
    setItems(s.docs.map(x => ({ id: x.id, ...x.data() }) as unknown as TimelineItem));
  }, []);
  useEffect(() => { load(); }, [load]);
  const pick = (t: TimelineItem | null) => { setSel(t ? t.id : ''); setMsg('');
    setD(t ? { year: t.year || t.date || '', role: t.role || t.title || '', company: t.company || '', desc: t.desc || t.description || '', tags: (t.tags || []).join(', ') } : blank); };
  const save = async () => {
    const data = { year: d.year.trim(), role: d.role.trim(), company: d.company.trim(), desc: d.desc.trim(), tags: d.tags.split(',').map(x => x.trim()).filter(Boolean) };
    if (!data.role) return setMsg('Role is required');
    try {
      if (sel) await setDoc(doc(db, 'timeline', sel), data, { merge: true }); else await addDoc(collection(db, 'timeline'), { ...data, createdAt: serverTimestamp() });
      clearCache(); setMsg('Saved'); setSel(null); load();
    } catch { setMsg('Save failed (are you signed in?)'); }
  };
  const del = async () => { if (sel && confirm('Delete this item?')) { await deleteDoc(doc(db, 'timeline', sel)); clearCache(); setSel(null); load(); } };
  const set = (k: keyof typeof blank) => (v: string) => setD(x => ({ ...x, [k]: v }));
  return (
    <div className="split"><aside>
      <button className="btn" onClick={() => pick(null)}>+ New item</button>
      {items.map(t => <button key={t.id} className={`li${t.id === sel ? ' on' : ''}`} onClick={() => pick(t)}>{t.year || t.date} {t.role || t.title}</button>)}
      <p className="muted tiny">Order on the site follows the order items were created.</p>
    </aside>{sel !== null ? (
      <div className="editor">
        <Field label="Year / period" value={d.year} onChange={set('year')} /><Field label="Role" value={d.role} onChange={set('role')} />
        <Field label="Company / place" value={d.company} onChange={set('company')} /><Field label="Description" value={d.desc} onChange={set('desc')} area />
        <Field label="Tags" value={d.tags} onChange={set('tags')} hint="comma separated" />
        <div className="savebar"><button className="btn primary" onClick={save}>Save</button>{sel && <button className="btn" onClick={del}>Delete</button>}<span role="status">{msg}</span></div>
      </div>) : <p className="muted">Pick an item or create one.</p>}</div>
  );
}

export function Reviews() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const load = useCallback(async () => {
    const s = await getDocs(collection(db, 'testimonials'));
    setItems(s.docs.map(x => ({ id: x.id, ...x.data() }) as unknown as Testimonial).sort((a, b) => (a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1)));
  }, []);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (id: string, status: 'pending' | 'approved') => { await updateDoc(doc(db, 'testimonials', id), { status }); load(); };
  const del = async (id: string) => { if (confirm('Delete this review?')) { await deleteDoc(doc(db, 'testimonials', id)); load(); } };
  if (!items.length) return <p className="muted">No reviews yet.</p>;
  return (
    <div>{items.map(t => (
      <div key={t.id} className="item"><div className="grow">
        <p><b>{t.name}</b> {t.role && <span className="muted">· {t.role}</span>} · {'★'.repeat(t.rating || 5)} · <span className={t.status === 'pending' ? 'err' : 'ok'}>{t.status}</span></p>
        <p className="muted">{t.message}</p></div>
        <div className="ctl2">
          {t.status === 'pending' ? <button className="btn primary" onClick={() => setStatus(t.id, 'approved')}>Approve</button> : <button className="btn" onClick={() => setStatus(t.id, 'pending')}>Unpublish</button>}
          <button className="btn" onClick={() => del(t.id)}>Delete</button></div></div>))}</div>
  );
}

export function Principles() {
  const [items, setItems] = useState<Principle[]>([]); const [sel, setSel] = useState<string | null>(null);
  const [d, setD] = useState({ title: '', description: '' }); const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const s = await getDocs(query(collection(db, 'principles'), orderBy('createdAt', 'asc'))).catch(() => getDocs(collection(db, 'principles')));
    setItems(s.docs.map(x => ({ id: x.id, ...x.data() }) as unknown as Principle));
  }, []);
  useEffect(() => { load(); }, [load]);
  const pick = (p: Principle | null) => { setSel(p ? p.id : ''); setMsg(''); setD({ title: p?.title || '', description: p?.description || '' }); };
  const save = async () => {
    const data = { title: d.title.trim(), description: d.description.trim() };
    if (!data.title) return setMsg('Title is required');
    try {
      if (sel) await updateDoc(doc(db, 'principles', sel), data); else await addDoc(collection(db, 'principles'), { ...data, createdAt: serverTimestamp() });
      clearCache(); setMsg('Saved'); setSel(null); load();
    } catch { setMsg('Save failed (are you signed in?)'); }
  };
  const del = async () => { if (sel && confirm('Delete this principle?')) { await deleteDoc(doc(db, 'principles', sel)); clearCache(); setSel(null); load(); } };
  return (
    <div className="split"><aside>
      <button className="btn" onClick={() => pick(null)}>+ New principle</button>
      {items.map(p => <button key={p.id} className={`li${p.id === sel ? ' on' : ''}`} onClick={() => pick(p)}>{p.title}</button>)}
      <p className="muted tiny">Order follows creation order. They are numbered automatically.</p>
    </aside>{sel !== null ? (
      <div className="editor">
        <Field label="Title" value={d.title} onChange={v => setD(x => ({ ...x, title: v }))} />
        <Field label="Description" value={d.description} onChange={v => setD(x => ({ ...x, description: v }))} area />
        <div className="savebar"><button className="btn primary" onClick={save}>Save</button>{sel && <button className="btn" onClick={del}>Delete</button>}<span role="status">{msg}</span></div>
      </div>) : <p className="muted">Pick a principle or create one.</p>}</div>
  );
}
