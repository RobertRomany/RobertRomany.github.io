import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app); // full SDK here only: this page needs live updates
import { every, included as isIn, money, totalOf } from '../proposal-utils';
import type { ProposalDoc, ProposalItem } from '../types';

type View = 'loading' | 'missing' | 'locked' | 'open';
export default function ProposalPage() {
  const { id } = useParams();
  const [view, setView] = useState<View>('loading');
  const [p, setP] = useState<ProposalDoc | null>(null);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const seeded = useRef(false);
  const timer = useRef<number>();

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.append(m);
    if (!id) { setView('missing'); return () => m.remove(); }
    const off = onSnapshot(doc(db, 'proposals', id), s => {
      if (!s.exists()) return setView('missing');
      const d = s.data() as ProposalDoc;
      setP(d);
      if (!seeded.current) { seeded.current = true; setSel(d.selections || {}); } // never overwrite what the client is editing
      setView(d.status === 'locked' ? 'locked' : 'open');
    }, () => setView('missing'));
    return () => { off(); m.remove(); };
  }, [id]);

  const toggle = (itemId: string, v: boolean) => {
    const next = { ...sel, [itemId]: v };
    setSel(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { updateDoc(doc(db, 'proposals', id!), { selections: next }).catch(console.error); }, 500);
  };

  if (view === 'loading') return <div className="prop center" dir="rtl"><div className="skel" style={{ width: 240 }} /></div>;
  if (view === 'missing') return <div className="prop center" dir="rtl" lang="ar"><h1>العرض غير موجود</h1><p>تأكد من اللينك اللي وصلك، أو تواصل معنا لإرسال لينك جديد.</p></div>;
  if (view === 'locked' || !p) return <div className="prop center" dir="rtl" lang="ar"><h1>تم إغلاق هذا العرض</h1><p>العرض ده اتقفل ومبقاش متاح للتعديل. لو محتاج نسخة تانية، تواصل مع الشركة اللي بعتتلك اللينك.</p></div>;

  const on = (i: ProposalItem) => isIn(i, sel);
  const total = totalOf(p, sel);
  return (
    <div className="prop" dir="rtl" lang="ar">
      <h1>{p.projectTitle}</h1>
      {p.clientName && <p className="muted">مُعد لـ {p.clientName}</p>}
      {p.categories.map(c => {
        const items = p.items.filter(i => i.categoryId === c.id);
        return items.length ? (
          <section key={c.id}><h2>{c.name}</h2>
            {items.map(i => (
              <label key={i.id} className={`row${on(i) ? '' : ' off'}`}>
                <input type="checkbox" checked={on(i)} disabled={i.tier === 'base'} onChange={e => toggle(i.id, e.target.checked)} />
                <span className="grow"><b>{i.name}</b>
                  {i.description && <small>{i.description}</small>}
                  <small className="mono">{every(i)}{i.tier === 'base' ? ' · أساسي' : ''}</small></span>
                <span className="mono price">{money(Number(i.price) || 0, p.currency)}</span>
              </label>))}
          </section>) : null;
      })}
      <div className="total"><span>الإجمالي</span><b className="mono">{money(total, p.currency)}</b></div>
      {p.notes && <p className="muted">{p.notes}</p>}
      <p className="muted tiny">اختياراتك بتتحفظ تلقائيًا.</p>
    </div>
  );
}
