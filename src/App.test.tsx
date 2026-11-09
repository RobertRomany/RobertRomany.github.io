// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./firebase', () => ({ app: {}, db: {} }));
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}), signInWithEmailAndPassword: vi.fn(), signOut: vi.fn(),
  onAuthStateChanged: (_a: unknown, cb: (u: null) => void) => { cb(null); return () => {}; },
}));
vi.mock('firebase/firestore/lite', () => ({
  collection: vi.fn(), doc: vi.fn(), query: vi.fn(), orderBy: vi.fn(), where: vi.fn(),
  getDoc: vi.fn(async () => ({ exists: () => false })), getDocs: vi.fn(async () => ({ docs: [] })),
  addDoc: vi.fn(), updateDoc: vi.fn(), setDoc: vi.fn(), deleteDoc: vi.fn(), deleteField: vi.fn(), serverTimestamp: vi.fn(),
}));
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
import App from './App';

afterEach(cleanup);

describe('routes', () => {
  it('/admin shows the sign-in form', async () => {
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });
  it('/ shows the hero headline', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
  });
});
