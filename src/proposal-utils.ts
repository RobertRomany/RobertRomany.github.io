import type { ProposalDoc, ProposalItem } from './types';
export const money = (n: number, c = 'EGP') => (c === 'USD' ? `$${n.toLocaleString('en-US')}` : `${n.toLocaleString('en-US')} ${c}`);
export const every = (i: ProposalItem) =>
  i.recurrence === 'monthly' ? 'يتجدد كل شهر' : i.recurrence === 'yearly' ? 'يتجدد كل سنة'
  : i.recurrence === 'custom' ? (i.recurrenceNote?.trim() || 'يتجدد بشكل دوري') : 'دفعة واحدة';
export const included = (i: ProposalItem, sel: Record<string, boolean>) => i.tier === 'base' || !!sel[i.id];
export const totalOf = (p: ProposalDoc, sel: Record<string, boolean>) => p.items.reduce((s, i) => (included(i, sel) ? s + (Number(i.price) || 0) : s), 0);
