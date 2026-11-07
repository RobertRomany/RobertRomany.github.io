import { describe, expect, it } from 'vitest';
import { every, included, money, totalOf } from './proposal-utils';
import type { ProposalDoc } from './types';

const p: ProposalDoc = { status: 'open', categories: [{ id: 'c', name: 'C' }], items: [
  { id: 'a', name: 'A', price: 1000, tier: 'base', categoryId: 'c' },
  { id: 'b', name: 'B', price: 500, tier: 'optional', categoryId: 'c', recurrence: 'monthly' }] };

describe('proposal utils', () => {
  it('always includes base items', () => expect(included(p.items[0], {})).toBe(true));
  it('adds optional items only when selected', () => { expect(totalOf(p, {})).toBe(1000); expect(totalOf(p, { b: true })).toBe(1500); });
  it('formats money', () => { expect(money(1500, 'EGP')).toBe('1,500 EGP'); expect(money(1500, 'USD')).toBe('$1,500'); });
  it('labels billing in Arabic', () => { expect(every(p.items[1])).toBe('يتجدد كل شهر'); expect(every(p.items[0])).toBe('دفعة واحدة'); });
});
