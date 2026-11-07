import { every, included, money, totalOf } from '../proposal-utils';
import type { ProposalDoc } from '../types';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Renders the client's current choices to a dark one-page PDF. html2canvas and jsPDF load only on click. */
export async function downloadProposalPDF(p: ProposalDoc, sel: Record<string, boolean>) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const cur = p.currency || 'EGP';
  const groups = p.categories.map(c => ({ c, items: p.items.filter(i => i.categoryId === c.id) })).filter(g => g.items.length);
  const node = document.createElement('div');
  node.dir = 'rtl'; node.lang = 'ar';
  node.style.cssText = "position:fixed;left:-99999px;top:0;width:760px;padding:40px;background:#0a0a0a;color:#e5e7eb;font-family:'IBM Plex Sans Arabic','Plus Jakarta Sans',sans-serif";
  node.innerHTML = `
    <h1 style="font-size:26px;margin:0 0 4px;color:#fff">${esc(p.projectTitle)}</h1>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:13px">مُعد لـ ${esc(p.clientName)}</p>
    ${groups.map(g => `<h3 style="color:#00f15e;font-size:14px;margin:22px 0 10px">${esc(g.c.name)}</h3>${g.items.map(i => `
      <div style="display:flex;gap:12px;align-items:center;padding:12px 14px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);opacity:${included(i, sel) ? 1 : .45}">
        <span style="width:18px;text-align:center;color:#00f15e;font-weight:900">${included(i, sel) ? '✓' : '○'}</span>
        <span style="flex:1"><b style="font-size:14px">${esc(i.name)}</b>
          ${i.description ? `<span style="display:block;font-size:12px;color:#9ca3af;margin-top:3px">${esc(i.description)}</span>` : ''}
          <span style="display:block;font-size:11px;color:#6b7280;margin-top:3px">${esc(every(i))}</span></span>
        <b dir="ltr" style="font-size:14px">${money(Number(i.price) || 0, cur)}</b></div>`).join('')}`).join('')}
    <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.12);margin-top:20px;padding-top:16px">
      <span style="color:#9ca3af">الإجمالي</span><b dir="ltr" style="font-size:26px;color:#00f15e">${money(totalOf(p, sel), cur)}</b></div>
    ${p.notes ? `<p style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.6">${esc(p.notes)}</p>` : ''}`;
  document.body.append(node);
  try {
    await document.fonts?.ready;
    const canvas = await html2canvas(node, { backgroundColor: '#0a0a0a', scale: 2, useCORS: true });
    const w = canvas.width / 2, h = canvas.height / 2;
    const pdf = new jsPDF({ orientation: h > w ? 'p' : 'l', unit: 'pt', format: [w, h] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
    pdf.save(`proposal-${(p.clientName || 'client').replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')}.pdf`);
  } finally { node.remove(); }
}
