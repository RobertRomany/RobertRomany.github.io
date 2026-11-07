// Runs after `vite build`. Writes dist/work/<slug>/index.html with real OG tags (LinkedIn/WhatsApp previews),
// plus sitemap.xml and robots.txt. If Firestore is unreachable it still writes the static files and never fails the build.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SITE = process.env.SITE_URL || 'https://robertromany.github.io';
const FS = 'https://firestore.googleapis.com/v1/projects/robert-portfolio-98d71/databases/(default)/documents/projects';
const base = readFileSync('dist/index.html', 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const str = f => f?.stringValue ?? '';
const abs = u => (u.startsWith('/') ? SITE + u : u); // images hosted in this repo use relative paths

async function fetchProjects() {
  const out = []; let token = '';
  do {
    const r = await fetch(`${FS}?pageSize=100${token ? `&pageToken=${token}` : ''}`);
    if (!r.ok) throw new Error(`Firestore responded ${r.status}`);
    const j = await r.json();
    for (const d of j.documents || []) {
      const f = d.fields || {};
      out.push({ slug: str(f.slug) || d.name.split('/').pop(), title: str(f.title), description: str(f.description), image: abs(str(f.cover) || str(f.thumbnail)) });
    }
    token = j.nextPageToken || '';
  } while (token);
  return out;
}

function pageFor(p) {
  const url = `${SITE}/work/${p.slug}`;
  const desc = esc(p.description.replace(/\s+/g, ' ').slice(0, 160));
  const title = esc(`${p.title} | Robert Romany`);
  const tags = `<meta property="og:description" content="${desc}" /><meta property="og:url" content="${url}" /><meta property="og:type" content="article" /><meta name="twitter:card" content="summary_large_image" /><link rel="canonical" href="${url}" />`;
  let h = base.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  if (p.image) h = h.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(p.image)}" />`);
  return h.replace('</head>', `${tags}</head>`);
}

let projects = [];
try { projects = (await fetchProjects()).filter(p => p.title); }
catch (e) { console.warn(`[prerender] skipped project pages: ${e.message}`); }

for (const p of projects) { mkdirSync(`dist/work/${p.slug}`, { recursive: true }); writeFileSync(`dist/work/${p.slug}/index.html`, pageFor(p)); }
const urls = ['/', '/about', ...projects.map(p => `/work/${p.slug}`)];
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${SITE}${u}</loc></url>`).join('')}</urlset>`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /p/\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`[prerender] ${projects.length} project page(s), sitemap, robots`);
