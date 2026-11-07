import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore/lite';
import { db } from '../firebase';
import { money, totalOf } from '../proposal-utils';
import { downloadProposalPDF } from './pdf';
import { Field } from './fields';
import type { ProposalItem, ProposalRow } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);
const move = <T,>(a: T[], i: number, d: number) => { const b = [...a], j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };
type Cat = { id: string; name: string };

function Editor({ p, onDone }: { p: ProposalRow | null; onDone: (id?: string) => void }) {
  const [title, setTitle] = useState(p?.projectTitle || ''); const [client, setClient] = useState(p?.clientName || '');
  const [cur, setCur] = useState(p?.currency || 'EGP'); const [notes, setNotes] = useState(p?.notes || '');
  const [cats, setCats] = useState<Cat[]>(p?.categories || [{ id: uid(), name: '' }]);
  const [items, setItems] = useState<ProposalItem[]>(p?.items || []); const [msg, setMsg] = useState('');
  const setItem = (id: string, patch: Partial<ProposalItem>) => setItems(a => a.map(x => x.id === id ? { ...x, ...patch } : x));
  const link = p ? `${location.origin}/p/${p.id}` : '';

  const save = async () => {
    const categories = cats.filter(c => c.name.trim()).map(c => ({ ...c, name: c.name.trim() }));
    const clean = items.filter(i => i.name.trim()).map(i => ({ ...i, name: i.name.trim(), price: Number(i.price) || 0 }));
    if (!title.trim() || !categories.length) return setMsg('Add a title and at least one named category');
    if (clean.some(i => !categories.some(c => c.id === i.categoryId))) return setMsg('Every item needs a category');
    const data = { projectTitle: title.trim(), clientName: client.trim(), currency: cur, notes: notes.trim(), categories, items: clean };
    try {
      if (p) { await updateDoc(doc(db, 'proposals', p.id), data); setMsg('Saved'); onDone(); }
      else { const r = await addDoc(collection(db, 'proposals'), { ...data, selections: {}, status: 'open', createdAt: serverTimestamp(), lockedAt: null }); onDone(r.id); }
    } catch { setMsg('Save failed (are you signed in?)'); }
  };
  const lock = async () => { if (!p) return; const l = p.status === 'open'; await updateDoc(doc(db, 'proposals', p.id), { status: l ? 'locked' : 'open', lockedAt: l ? serverTimestamp() : null }); onDone(); };
  const del = async () => { if (p && confirm('Delete this proposal?')) { await deleteDoc(doc(db, 'proposals', p.id)); onDone('-'); } };
  const pdf = async () => { if (!p) return; setMsg('Building PDF…'); try { await downloadProposalPDF({ ...p, projectTitle: title, clientName: client, items, categories: cats }, p.selections || {}); setMsg(''); } catch { setMsg('PDF failed'); } };

  return (
    <div className="editor">
      {p && <div className="linkbox"><code>{link}</code>
        <button className="btn" onClick={() => navigator.clipboard.writeText(link).then(() => setMsg('Link copied'))}>Copy link</button>
        <span className={p.status === 'open' ? 'ok' : 'err'}>{p.status}</span></div>}
      <Field label="Project title" value={title} onChange={setTitle} /><Field label="Client name" value={client} onChange={setClient} />
      <label className="fld"><span>Currency</span><select value={cur} onChange={e => setCur(e.target.value)}><option>EGP</option><option>USD</option></select></label>
      <h3>Categories</h3>
      {cats.map((c, i) => (
        <div key={c.id} className="rowline"><input aria-label="Category name" value={c.name} onChange={e => setCats(a => a.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} />
          <button aria-label="Up" disabled={!i} onClick={() => setCats(a => move(a, i, -1))}>↑</button>
          <button aria-label="Down" disabled={i === cats.length - 1} onClick={() => setCats(a => move(a, i, 1))}>↓</button>
          <button aria-label="Remove" disabled={items.some(x => x.categoryId === c.id) || cats.length === 1} onClick={() => setCats(a => a.filter(x => x.id !== c.id))}>✕</button></div>))}
      <button className="btn" onClick={() => setCats(a => [...a, { id: uid(), name: '' }])}>+ Category</button>
      <h3>Items</h3>
      {items.map((it, i) => (
        <div key={it.id} className="item"><div className="grow">
          <Field label="Name" value={it.name} onChange={v => setItem(it.id, { name: v })} />
          <Field label="Description" value={it.description || ''} onChange={v => setItem(it.id, { description: v })} area />
          <div className="two">
            <label className="fld"><span>Price</span><input type="number" min={0} value={it.price} onChange={e => setItem(it.id, { price: Number(e.target.value) })} /></label>
            <label className="fld"><span>Type</span><select value={it.tier} onChange={e => setItem(it.id, { tier: e.target.value as 'base' | 'optional' })}><option value="base">base (always included)</option><option value="optional">optional (client chooses)</option></select></label>
            <label className="fld"><span>Category</span><select value={it.categoryId} onChange={e => setItem(it.id, { categoryId: e.target.value })}>{cats.map(c => <option key={c.id} value={c.id}>{c.name || '(unnamed)'}</option>)}</select></label>
            <label className="fld"><span>Billing</span><select value={it.recurrence || 'once'} onChange={e => setItem(it.id, { recurrence: e.target.value })}><option value="once">one time</option><option value="monthly">monthly</option><option value="yearly">yearly</option><option value="custom">custom note</option></select></label></div>
          {it.recurrence === 'custom' && <Field label="Billing note" value={it.recurrenceNote || ''} onChange={v => setItem(it.id, { recurrenceNote: v })} />}</div>
          <div className="ctl"><button aria-label="Up" disabled={!i} onClick={() => setItems(a => move(a, i, -1))}>↑</button>
            <button aria-label="Down" disabled={i === items.length - 1} onClick={() => setItems(a => move(a, i, 1))}>↓</button>
            <button aria-label="Remove" onClick={() => setItems(a => a.filter(x => x.id !== it.id))}>✕</button></div></div>))}
      <button className="btn" onClick={() => setItems(a => [...a, { id: uid(), name: '', price: 0, tier: 'base', categoryId: cats[0]?.id || '', recurrence: 'once' }])}>+ Item</button>
      <Field label="Notes (shown under the total)" value={notes} onChange={setNotes} area />
      <div className="savebar"><button className="btn primary" onClick={save}>Save</button>
        {p && <><button className="btn" onClick={pdf}>Download PDF</button><button className="btn" onClick={lock}>{p.status === 'open' ? 'Lock' : 'Reopen'}</button><button className="btn" onClick={del}>Delete</button></>}
        <span role="status">{msg}</span></div>
    </div>
  );
}

export function Proposals() {
  const [rows, setRows] = useState<ProposalRow[]>([]); const [sel, setSel] = useState<string | null>(null);
  const load = useCallback(async () => {
    const s = await getDocs(query(collection(db, 'proposals'), orderBy('createdAt', 'desc'))).catch(() => getDocs(collection(db, 'proposals')));
    setRows(s.docs.map(x => ({ id: x.id, ...x.data() }) as unknown as ProposalRow));
  }, []);
  useEffect(() => { load(); }, [load]);
  const cur = rows.find(r => r.id === sel) || null;
  const done = async (id?: string) => { await load(); if (id) setSel(id === '-' ? null : id); };
  return (
    <div className="split"><aside>
      <button className="btn" onClick={() => setSel('')}>+ New proposal</button>
      {rows.map(r => <button key={r.id} className={`li${r.id === sel ? ' on' : ''}`} onClick={() => setSel(r.id)}>
        {r.projectTitle}<small className="muted"> {r.clientName} · {money(totalOf(r, r.selections || {}), r.currency)} · {r.status}</small></button>)}
    </aside>{sel !== null ? <Editor key={sel + (cur ? 'x' : '')} p={cur} onDone={done} /> : <p className="muted">Pick a proposal or create one.</p>}</div>
  );
}
