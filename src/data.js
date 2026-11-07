import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

// Same fallback pattern as the old site: try ordered query, fall back to plain read.
export function useCollection(name, field = 'createdAt', dir = 'asc') {
  const [state, set] = useState({ items: [], loading: true });
  useEffect(() => {
    let alive = true;
    (async () => {
      let snap;
      try { snap = await getDocs(query(collection(db, name), orderBy(field, dir))); }
      catch { try { snap = await getDocs(collection(db, name)); } catch { snap = null; } }
      if (alive) set({ items: snap ? snap.docs.map(d => ({ id: d.id, ...d.data() })) : [], loading: false });
    })();
    return () => { alive = false; };
  }, [name, field, dir]);
  return state;
}

export function useDocument(col, id) {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDoc(doc(db, col, id)).then(s => setData(s.exists() ? s.data() : null)).catch(() => {});
  }, [col, id]);
  return data;
}

export const CV_URL = 'https://drive.google.com/file/d/1n2hG5sEccsvmQ8lGFIOWe4UccxXXXFj8/view?usp=sharing';
export const EMAIL = 'robert.romany.dev@gmail.com';
export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/robert-romany-dev/',
  github: 'https://github.com/Robert-x1',
};
