import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { db } from './firebase';
import { useApproved } from './data';

const Stars = ({ n }: { n: number }) => <span className="stars" role="img" aria-label={`${n} out of 5`}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
const initials = (s: string) => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function ReviewForm() {
  const [f, setF] = useState({ name: '', role: '', message: '', rating: 5, website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const set = (k: string, v: string | number) => setF(x => ({ ...x, [k]: v }));
  const submit = async () => {
    if (f.name.trim().length < 2 || f.message.trim().length < 10) return setState('error');
    if (f.website) return setState('done'); // honeypot: bots fill hidden fields
    setState('sending');
    try {
      await addDoc(collection(db, 'testimonials'), { name: f.name.trim().slice(0, 60), role: f.role.trim().slice(0, 80), message: f.message.trim().slice(0, 600), rating: f.rating, status: 'pending', timestamp: serverTimestamp() });
      setState('done');
    } catch { setState('error'); }
  };
  if (state === 'done') return <p className="status" role="status">Thank you. Your review will appear after I approve it.</p>;
  return (
    <div className="review-form">
      <label className="fld"><span>Your name</span><input maxLength={60} value={f.name} onChange={e => set('name', e.target.value)} /></label>
      <label className="fld"><span>Role / company (optional)</span><input maxLength={80} value={f.role} onChange={e => set('role', e.target.value)} /></label>
      <label className="fld"><span>Your review</span><textarea rows={4} maxLength={600} value={f.message} onChange={e => set('message', e.target.value)} /></label>
      <fieldset className="rate"><legend>Rating</legend>
        {[1, 2, 3, 4, 5].map(n => <label key={n}><input type="radio" name="rating" checked={f.rating === n} onChange={() => set('rating', n)} /><span>{n}★</span></label>)}</fieldset>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={e => set('website', e.target.value)} />
      <button className="btn primary" onClick={submit} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send review'}</button>
      {state === 'error' && <p className="err" role="alert">Add your name and a message of at least 10 characters, or try again.</p>}
    </div>
  );
}

export default function Testimonials() {
  const items = useApproved();
  const [open, setOpen] = useState(false);
  return (
    <section id="reviews"><div className="wrap">
      <h2>{items.length ? 'What people say about working with me' : 'Worked with me?'}</h2>
      {items.length > 0 && (
        <div className="quotes">{items.map(t => (
          <figure key={t.id} className="quote">
            <Stars n={t.rating || 5} /><blockquote>{t.message}</blockquote>
            <figcaption><i>{initials(t.name || 'A')}</i><span><b>{t.name}</b>{t.role && <small>{t.role}</small>}</span></figcaption>
          </figure>))}</div>)}
      <button className="btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? 'Close' : 'Leave a review'}</button>
      {open && <ReviewForm />}
    </div></section>
  );
}
