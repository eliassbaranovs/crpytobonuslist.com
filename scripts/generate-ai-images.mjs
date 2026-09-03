// AI cover image generator for casino reviews (gpt-image-1).
// Run from the site root:  OPENAI_API_KEY=sk-... node scripts/generate-ai-images.mjs [imageKey]
// Output: public/images/<file>.webp. Existing covers (wild-io, flush-2) are night-time casino
// exteriors in near-black and warm gold with the brand name and review title overlaid.
import OpenAI from 'openai';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images');

const IMAGES = [
  {
    key: 'lanista',
    file: 'lanista-casino-cover',
    size: '1536x1024',
    prompt: [
      'Cinematic wide shot of a Roman colosseum arena at night, photographed from the sand floor looking up at tiered stone arches.',
      'Warm gold torchlight and braziers glow along the arcades, rich amber highlights on weathered stone, deep near-black navy sky (#0A0A0A) with faint stars.',
      'A single gladiator helmet with a red crest and a short sword rest on the sand in the foreground, subtle wet-sand reflections of the gold light.',
      'Premium, moody, high-contrast editorial photography look, shallow depth of field, no people, no crowds.',
      'Large clean white sans-serif headline centered in the upper third reading exactly: "LANISTA" on the first line in bold, then "Lanista Casino Review:" on the second line, then "200% Crypto Bonus, Tight Withdrawal Caps" on the third line.',
      'Text must be perfectly spelled, crisp, legible, white with a soft dark glow behind it. No other text, no logos, no watermarks, no UI elements.',
    ].join(' '),
  },
];

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error('Set OPENAI_API_KEY in the environment first (do not commit it).');
  process.exit(1);
}

const wanted = process.argv[2];
const targets = wanted ? IMAGES.filter((i) => i.key === wanted) : IMAGES;
if (targets.length === 0) {
  console.error(`No image with key "${wanted}". Known keys: ${IMAGES.map((i) => i.key).join(', ')}`);
  process.exit(1);
}

const client = new OpenAI({ apiKey: key });
await mkdir(outDir, { recursive: true });

for (const img of targets) {
  process.stdout.write(`generating ${img.file} (${img.size})... `);
  const res = await client.images.generate({
    model: 'gpt-image-1',
    prompt: img.prompt,
    size: img.size,
    quality: 'high',
  });
  const b64 = res.data[0].b64_json;
  const png = Buffer.from(b64, 'base64');
  const out = join(outDir, `${img.file}.webp`);
  await sharp(png).webp({ quality: 82 }).toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`done -> public/images/${img.file}.webp (${meta.width}x${meta.height})`);
}

console.log('\nNext: set image/imageWidth/imageHeight in the review frontmatter to the new cover.');
