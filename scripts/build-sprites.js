// Upscales 1x pixel-art exports with nearest-neighbor so sprites stay crisp on device.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_SIZE = 2048;
const SRC_DIR = path.join(__dirname, '..', 'assets', 'pixel-src', 'export');
const OUT_DIR = path.join(__dirname, '..', 'assets');

const ICONS = [
  'back',
  'help',
  'settings',
  'check',
  'dice',
  'bomb',
  'boom',
  'coin',
  'chain',
  'eyes',
  'abc',
  'rps',
];

const ENTRIES = [
  { src: 'bombIdle.png', out: 'sprites/bombIdle.png', scale: 16 },
  { src: 'bombArmed.png', out: 'sprites/bombArmed.png', scale: 16 },
  { src: 'explosion.png', out: 'sprites/explosion.png', scale: 8 },
  { src: 'coin.png', out: 'sprites/coin.png', scale: 12 },
  { src: 'loader.png', out: 'sprites/loader.png', scale: 12 },
  ...ICONS.map(name => ({ src: `icons/${name}.png`, out: `icons/${name}.png`, scale: 12 })),
  { src: 'backgrounds/default.png', out: 'backgrounds/default.png', scale: 5 },
  { src: 'backgrounds/city.png', out: 'backgrounds/city.png', scale: 5 },
];

async function build({ src, out, scale }) {
  const input = path.join(SRC_DIR, src);
  const { width, height } = await sharp(input).metadata();
  const outWidth = width * scale;
  const outHeight = height * scale;
  if (outWidth > MAX_SIZE || outHeight > MAX_SIZE) {
    throw new Error(`${src}: ${outWidth}x${outHeight} exceeds ${MAX_SIZE}px`);
  }
  const output = path.join(OUT_DIR, out);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(input)
    .resize({ width: outWidth, height: outHeight, kernel: 'nearest' })
    .png({ palette: true, dither: 0, compressionLevel: 9 })
    .toFile(output);
  process.stdout.write(`${src} -> ${out} (${outWidth}x${outHeight})\n`);
}

async function main() {
  for (const entry of ENTRIES) {
    await build(entry);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
