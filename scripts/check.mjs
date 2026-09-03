// Acceptance gate: scans the build output for title/meta/h1/canonical issues,
// broken internal links, and required root files. Run after the site build.
//
// Usage: node scripts/check.mjs [distDir] [canonicalOrigin]
//   distDir          build output (default: <kit-root>/dist). Relative to cwd.
//   canonicalOrigin  e.g. https://example.com — if omitted, derived from the
//                    homepage's own <link rel="canonical">.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(root, 'dist');
let origin = process.argv[3] || '';
const problems = [];
const ok = [];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };
const htmlFiles = await walk(dist);
const titles = new Map();
const descs = new Map();

// derive canonical origin from the homepage if not given
if (!origin) {
  try {
    const home = await readFile(join(dist, 'index.html'), 'utf8');
    const canon = (home.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
    origin = (canon.match(/^https:\/\/[^/]+/) || [])[0] || '';
  } catch { /* falls through to the per-page failure below */ }
}
if (!origin) problems.push('Could not determine canonical origin (pass it as argv[3])');

for (const f of htmlFiles) {
  const html = await readFile(f, 'utf8');
  const rel = f.replace(dist, '').replace(/\\/g, '/');
  // utility pages (404 variants, Next _not-found, thank-you) are noindex — skip
  // uniqueness/canonical/desc requirements for them
  const isUtility = /404\.html$|\/404\/|_not-found|\/thank-you\//.test(rel);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const h1s = (html.match(/<h1[ >]/g) || []).length;
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';

  if (!title) problems.push(`${rel}: missing <title>`);
  else if (title.length > 60) problems.push(`${rel}: title ${title.length} chars >60 — "${title}"`);
  if (!isUtility) {
    if (!desc) problems.push(`${rel}: missing meta description`);
    else if (desc.length < 120 || desc.length > 160) problems.push(`${rel}: desc ${desc.length} chars (need 120-160)`);
    if (!origin || !canon.startsWith(origin)) problems.push(`${rel}: bad/missing canonical "${canon}"`);
    if (title) { titles.set(title, (titles.get(title) || 0) + 1); }
    if (desc) { descs.set(desc, (descs.get(desc) || 0) + 1); }
  }
  if (h1s !== 1) problems.push(`${rel}: ${h1s} <h1> (need exactly 1)`);

  // internal link check
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    if (h.startsWith('//')) continue;
    if (/\.(png|svg|ico|xml|txt|webp|jpg|css|js|woff2?)$/.test(h)) {
      if (!(await exists(join(dist, h)))) problems.push(`${rel}: broken asset link ${h}`);
      continue;
    }
    const target = join(dist, h, 'index.html');
    if (!(await exists(target))) problems.push(`${rel}: broken internal link ${h}`);
  }
}

for (const [t, n] of titles) if (n > 1) problems.push(`Duplicate title (${n}x): "${t}"`);
for (const [d, n] of descs) if (n > 1) problems.push(`Duplicate description (${n}x)`);

// each requirement accepts any one of its alternate paths (Astro vs Next conventions)
const rootFiles = [
  ['robots.txt'],
  ['llms.txt'],
  ['sitemap.xml', 'sitemap-index.xml'],
  ['favicon.ico'],
  ['favicon.svg'],
  ['apple-touch-icon.png'],
  ['og/default.png', 'img/og.png'],
  ['404.html'],
  ['.htaccess'],
];
for (const alts of rootFiles) {
  let found = '';
  for (const rf of alts) if (await exists(join(dist, rf))) { found = rf; break; }
  if (found) ok.push(found); else problems.push(`Missing root file: ${alts.join(' or ')}`);
}

console.log(`Pages scanned: ${htmlFiles.length} (origin: ${origin || 'unknown'})`);
console.log(`Root files present: ${ok.join(', ')}`);
if (problems.length === 0) {
  console.log('\n✅ GATE PASSED — no issues found.');
} else {
  console.log(`\n❌ ${problems.length} issue(s):`);
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
