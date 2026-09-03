// Generates the brand raster assets that can't be SVG: OG image, favicon.ico,
// apple-touch-icon. Run: `node scripts/build-assets.mjs`. No API key needed.
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

// ---- 1200x630 Open Graph image ------------------------------------------------
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="22%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#1b1740"/>
      <stop offset="60%" stop-color="#0e1116"/>
      <stop offset="100%" stop-color="#0e1116"/>
    </radialGradient>
    <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8267fb"/>
      <stop offset="70%" stop-color="#5236e8"/>
      <stop offset="100%" stop-color="#16e07a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <!-- dotted texture -->
  <g fill="#5236e8" opacity="0.10">
    ${Array.from({ length: 11 }).map((_, r) =>
      Array.from({ length: 22 }).map((_, c) => `<circle cx="${40 + c * 54}" cy="${40 + r * 54}" r="2"/>`).join('')
    ).join('')}
  </g>
  <!-- route motif -->
  <path d="M90 470 C 320 470, 320 360, 560 360 S 800 470, 980 360" fill="none" stroke="url(#route)" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
  <circle cx="90" cy="470" r="14" fill="#5236e8"/>
  <rect x="966" y="346" width="28" height="28" rx="7" fill="#16e07a"/>
  <!-- mono kicker -->
  <text x="90" y="150" fill="#a692ff" font-family="JetBrains Mono, Consolas, monospace" font-size="26" letter-spacing="4">AI-DRIVEN EMAIL MARKETING AGENCY</text>
  <!-- wordmark / headline -->
  <text x="86" y="250" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="92" letter-spacing="-3">Email Path</text>
  <text x="90" y="320" fill="#eaecef" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="38">Email that earns the inbox, and the revenue.</text>
  <text x="90" y="585" fill="#9aa3af" font-family="JetBrains Mono, Consolas, monospace" font-size="24">emailpath.online</text>
</svg>`;

// ---- favicon source (matches public/favicon.svg) ------------------------------
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#5236e8"/>
  <circle cx="8" cy="16" r="3" fill="#fff"/>
  <path d="M8 16 H15 C18 16 18 9 21 9 H25" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M8 16 H15 C18 16 18 23 21 23 H25" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.7"/>
  <rect x="22.5" y="6" width="5.5" height="5.5" rx="1.5" fill="#fff"/>
  <rect x="22.5" y="20.5" width="5.5" height="5.5" rx="1.5" fill="#16e07a"/>
</svg>`;

await mkdir(join(pub, 'og'), { recursive: true });

await sharp(Buffer.from(og)).png().toFile(join(pub, 'og', 'default.png'));
console.log('✓ og/default.png');

await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');

const ico32 = await sharp(Buffer.from(icon)).resize(32, 32).png().toBuffer();
const ico48 = await sharp(Buffer.from(icon)).resize(48, 48).png().toBuffer();
await writeFile(join(pub, 'favicon.ico'), await pngToIco([ico32, ico48]));
console.log('✓ favicon.ico');

console.log('Done.');
