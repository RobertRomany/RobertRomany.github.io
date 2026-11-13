import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query, where, type QuerySnapshot } from 'firebase/firestore/lite';
import { db } from './firebase';
import { defaults } from './content';
import type { HomeContent, Project, Testimonial } from './types';

const cache = new Map<string, unknown[]>();
export function useCollection<T extends { id: string }>(name: string, field = 'createdAt', dir: 'asc' | 'desc' = 'asc', rev = 0) {
  const key = `${name}:${field}:${dir}:${rev}`;
  const [state, set] = useState<{ items: T[]; loading: boolean; error: boolean }>(() => ({ items: (cache.get(key) as T[]) || [], loading: !cache.has(key), error: false }));
  useEffect(() => {
    let alive = true;
    (async () => {
      let snap: QuerySnapshot | null = null;
      try { snap = await getDocs(query(collection(db, name), orderBy(field, dir))); }
      catch { try { snap = await getDocs(collection(db, name)); } catch { snap = null; } }
      const items = snap ? snap.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as T) : [];
      if (snap) cache.set(key, items);
      if (alive) set({ items, loading: false, error: !snap });
    })();
    return () => { alive = false; };
  }, [key, name, field, dir]);
  return state;
}

export function useDocument<T>(col: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => { getDoc(doc(db, col, id)).then(s => setData(s.exists() ? (s.data() as T) : null)).catch(() => {}); }, [col, id]);
  return data;
}
export const useHome = (): HomeContent => ({ ...defaults, ...(useDocument<HomeContent>('site_content', 'home') || {}) });
export const useHeroText = () => useDocument<{ subtitle?: string }>('site_content', 'hero');
export const slugOf = (p: Project) => p.slug || p.id;

export const CV_URL = 'https://drive.google.com/file/d/1So3iyEaXK-kq9pp9absZHYk8kMESa05h/view?usp=sharing';
export const EMAIL = 'robert.romany.dev@gmail.com';
export const LINKS = { linkedin: 'https://www.linkedin.com/in/robert-romany-dev/', github: 'https://github.com/Robert-x1' };
export const clearCache = () => cache.clear();

// Rules only allow reading approved testimonials, so the query must filter on status.
export function useApproved() {
  const [items, setItems] = useState<Testimonial[]>([]);
  useEffect(() => {
    const base = collection(db, 'testimonials');
    getDocs(query(base, where('status', '==', 'approved'), orderBy('timestamp', 'desc')))
      .catch(() => getDocs(query(base, where('status', '==', 'approved'))))
      .then(s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as Testimonial)))
      .catch(() => {});
  }, []);
  return items;
}
