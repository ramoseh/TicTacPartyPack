// Generates the 1x pixel art in assets/pixel-src/export from code; `npm run sprites` then upscales it.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets', 'pixel-src', 'export');

// Mirrors palette in theme/pixel.ts.
const P = {
  ink: '#0F0F1B',
  night: '#1C1C3A',
  slate: '#2E3150',
  steel: '#565A7A',
  fog: '#A2ABB6',
  gray: '#C2C3C7',
  paper: '#F4F1E6',
  white: '#FFFFFF',
  black: '#000000',
  red: '#D62839',
  maroon: '#7A1023',
  orange: '#F77F00',
  yellow: '#FCBF49',
  blue: '#3A86FF',
  navy: '#1D4E9E',
  green: '#38B764',
};

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

function canvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}
function px(c, x, y, color) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  if (color === null) {
    c.data[i + 3] = 0;
    return;
  }
  const [r, g, b] = rgb(P[color]);
  c.data[i] = r;
  c.data[i + 1] = g;
  c.data[i + 2] = b;
  c.data[i + 3] = 255;
}
function rect(c, x, y, w, h, color) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(c, i, j, color);
}
function disc(c, cx, cy, r, color, filter) {
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) {
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r && (!filter || filter(x, y))) px(c, x, y, color);
    }
  }
}
function ellipse(c, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) {
    for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const dx = (x + 0.5 - cx) / Math.max(rx, 0.5);
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) px(c, x, y, color);
    }
  }
}
function line(c, x0, y0, x1, y1, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= steps; s++) {
    const t = steps === 0 ? 0 : s / steps;
    px(c, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, color);
  }
}
function draw(c, rows, ox, oy, map) {
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (map[ch]) px(c, ox + x, oy + y, map[ch]);
    })
  );
}
// Deterministic noise so regenerated art is identical every run.
const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
function sheet(frames, cols) {
  const fw = frames[0].w;
  const fh = frames[0].h;
  const rows = Math.ceil(frames.length / cols);
  const s = canvas(fw * cols, fh * rows);
  frames.forEach((f, i) => {
    const ox = (i % cols) * fw;
    const oy = Math.floor(i / cols) * fh;
    for (let y = 0; y < fh; y++) {
      f.data.copy(s.data, ((oy + y) * s.w + ox) * 4, y * fw * 4, (y + 1) * fw * 4);
    }
  });
  return s;
}
async function save(c, file) {
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(c.data, { raw: { width: c.w, height: c.h, channels: 4 } })
    .png()
    .toFile(out);
}

// --- Bomb (32x32) ---
function bombBody(c, ox, oy, size, glow) {
  const k = size / 32;
  disc(c, ox + 15 * k, oy + 19 * k, 12 * k, 'fog');
  disc(c, ox + 15 * k, oy + 19 * k, 11 * k, 'black');
  disc(c, ox + 15 * k, oy + 19 * k, 10 * k, glow ? 'maroon' : 'slate');
  disc(
    c,
    ox + 15 * k,
    oy + 19 * k,
    7 * k,
    glow ? 'red' : 'steel',
    (x, y) => x + y < ox + oy + 34 * k
  );
  disc(c, ox + 11 * k, oy + 15 * k, 2.5 * k, glow ? 'orange' : 'fog');
  px(c, ox + 10 * k, oy + 14 * k, 'white');
  rect(c, ox + 11 * k, oy + 5 * k, 9 * k, 5 * k, 'fog');
  rect(c, ox + 12 * k, oy + 6 * k, 7 * k, 3 * k, 'black');
  rect(c, ox + 13 * k, oy + 6 * k, 5 * k, 2 * k, 'steel');
}
function bombFrame(i, armed) {
  const c = canvas(32, 32);
  bombBody(c, 0, 0, 32, armed && i % 2 === 1);
  const fuse = [
    [16, 5],
    [17, 4],
    [18, 3],
    [19, 3],
    [20, 2],
    [21, 2],
  ];
  const len = armed ? fuse.length - (i % 2) : fuse.length;
  fuse.slice(0, len).forEach(([x, y]) => px(c, x, y, 'gray'));
  const [tx, ty] = fuse[len - 1];
  const sparks = armed
    ? [
        [
          [0, -1],
          [1, 0],
          [-1, -1],
          [1, -2],
          [2, 1],
        ],
        [
          [1, -1],
          [-1, 0],
          [2, -1],
          [0, -2],
        ],
        [
          [0, -1],
          [1, 1],
          [2, -2],
          [-1, -2],
          [3, 0],
        ],
        [
          [1, 0],
          [0, -2],
          [2, -1],
        ],
      ][i]
    : [
        [
          [0, -1],
          [1, 0],
        ],
        [[1, -1]],
        [
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        [],
      ][i];
  px(c, tx + 1, ty - 1, armed ? 'white' : 'yellow');
  sparks.forEach(([dx, dy], j) => px(c, tx + 1 + dx, ty - 1 + dy, j % 2 ? 'orange' : 'yellow'));
  if (armed && i % 2 === 0) {
    px(c, tx + 3, ty - 3, 'red');
    px(c, tx - 1, ty - 3, 'orange');
  }
  return c;
}

// --- Explosion (64x64, 10 frames; last = smoke) ---
function explosionFrame(i) {
  const c = canvas(64, 64);
  const cx = 32;
  const cy = 34;
  const jag = (s, amt) => (x, y) => hash(x, y, s) > amt;
  const radii = [5, 10, 15, 20, 24, 26, 25, 22, 20, 18];
  const r = radii[i];
  if (i <= 5) {
    disc(c, cx, cy, r, i >= 3 ? 'maroon' : 'red', jag(i, 0.12));
    disc(c, cx, cy, r * 0.82, 'red', jag(i + 10, 0.08));
    disc(c, cx, cy, r * 0.64, 'orange', jag(i + 20, 0.06));
    disc(c, cx, cy, r * 0.42, 'yellow');
    if (i < 4) disc(c, cx, cy, r * 0.22, 'white');
    for (let k = 0; k < 6 + i * 2; k++) {
      const a = (k / (6 + i * 2)) * Math.PI * 2 + i;
      const d = r + 2 + hash(k, i) * 5;
      px(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, k % 2 ? 'orange' : 'yellow');
    }
  } else {
    const t = i - 6;
    disc(c, cx, cy - t * 2, r, 'steel', jag(i, 0.25 + t * 0.12));
    disc(c, cx - 4, cy - t * 2 - 3, r * 0.6, 'fog', jag(i + 7, 0.3 + t * 0.1));
    disc(c, cx + 6, cy - t * 2 + 2, r * 0.45, 'slate', jag(i + 9, 0.3));
    if (t === 0) {
      disc(c, cx, cy + 4, 6, 'orange', jag(3, 0.4));
      disc(c, cx, cy + 4, 3, 'yellow');
    }
    if (t === 1) disc(c, cx, cy + 6, 3, 'red', jag(4, 0.4));
  }
  return c;
}

// --- Coin (16x16): 8 spin frames + heads + tails ---
function coinFrame(i) {
  const c = canvas(16, 16);
  if (i < 8) {
    const rx = [7, 6, 4, 2, 1, 2, 4, 6][i];
    ellipse(c, 8, 8, rx + 0.5, 7.5, 'orange');
    if (rx > 1) ellipse(c, 8, 8, rx - 0.5, 6.5, 'yellow');
    if (rx > 3) line(c, 8 - Math.floor(rx / 2), 4, 8 - Math.floor(rx / 2), 6, 'white');
  } else {
    disc(c, 8, 8, 7.5, 'orange');
    disc(c, 8, 8, 6.5, 'yellow');
    if (i === 8) {
      draw(c, ['.##.', '#..#', '....', '#..#', '.##.'], 6, 6, { '#': 'orange' });
      px(c, 6, 6, 'orange');
      px(c, 9, 6, 'orange');
    } else {
      rect(c, 7, 4, 2, 8, 'orange');
      rect(c, 4, 7, 8, 2, 'orange');
    }
  }
  return c;
}

// --- Loader (16x16, 4 frames) ---
function loaderFrame(i) {
  const c = canvas(16, 16);
  const cells = [
    [1, 1],
    [9, 1],
    [9, 9],
    [1, 9],
  ];
  cells.forEach(([x, y], k) =>
    rect(c, x, y, 6, 6, k === i ? 'yellow' : k === (i + 3) % 4 ? 'orange' : 'slate')
  );
  return c;
}

// --- Icons ---
function outlined(c, rows, ox, oy, fill) {
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '#') return;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (!rows[ny] || rows[ny][nx] !== '#') px(c, ox + nx, oy + ny, 'black');
      }
    })
  );
  draw(c, rows, ox, oy, { '#': fill });
}
const ICONS = {
  back: c =>
    outlined(
      c,
      [
        '.....#.......',
        '....##.......',
        '...###.......',
        '..##########.',
        '.###########.',
        '..##########.',
        '...###.......',
        '....##.......',
        '.....#.......',
      ],
      1,
      3,
      'white'
    ),
  help: c => {
    rect(c, 1, 1, 14, 14, 'black');
    rect(c, 2, 2, 12, 12, 'blue');
    draw(c, ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'], 5, 4, {
      '#': 'white',
    });
  },
  settings: c => {
    disc(c, 8, 8, 7, 'black');
    disc(c, 8, 8, 6, 'fog');
    for (const [x, y] of [
      [7, 0],
      [7, 14],
      [0, 7],
      [14, 7],
    ]) {
      rect(c, x, y, 2, 2, 'fog');
    }
    disc(c, 8, 8, 2.5, 'black');
  },
  check: c =>
    outlined(
      c,
      [
        '...........##',
        '..........##.',
        '.........##..',
        '##.....###...',
        '###...###....',
        '.###.###.....',
        '..#####......',
        '...###.......',
      ],
      1,
      4,
      'green'
    ),
  dice: c => {
    rect(c, 1, 1, 14, 14, 'black');
    rect(c, 2, 2, 12, 12, 'white');
    for (const [x, y] of [
      [4, 4],
      [10, 4],
      [7, 7],
      [4, 10],
      [10, 10],
    ]) {
      rect(c, x, y, 2, 2, 'black');
    }
  },
  bomb: c => {
    bombBody(c, 0, 0, 16, false);
    px(c, 9, 2, 'gray');
    px(c, 10, 1, 'yellow');
    px(c, 11, 0, 'orange');
  },
  boom: c => {
    disc(c, 8, 8, 7.5, 'red', (x, y) => (x + y) % 3 !== 0 || hash(x, y) > 0.5);
    disc(c, 8, 8, 5, 'orange');
    disc(c, 8, 8, 3, 'yellow');
    px(c, 8, 8, 'white');
  },
  coin: c => {
    disc(c, 8, 8, 7.5, 'orange');
    disc(c, 8, 8, 6.5, 'yellow');
    line(c, 6, 4, 6, 6, 'white');
  },
  chain: c => {
    for (const [ox, oy] of [
      [1, 5],
      [8, 5],
    ]) {
      rect(c, ox, oy, 7, 6, 'black');
      rect(c, ox + 1, oy + 1, 5, 4, 'gray');
      rect(c, ox + 2, oy + 2, 3, 2, null);
    }
    rect(c, 6, 7, 4, 2, 'fog');
  },
  eyes: c => {
    for (const ox of [1, 9]) {
      ellipse(c, ox + 3, 8, 3.5, 4.5, 'black');
      ellipse(c, ox + 3, 8, 2.5, 3.5, 'white');
      rect(c, ox + 3, 8, 2, 2, 'black');
    }
  },
  abc: c => {
    rect(c, 0, 3, 16, 10, 'black');
    rect(c, 1, 4, 14, 8, 'navy');
    draw(c, ['.#.', '#.#', '###', '#.#', '#.#'], 2, 6, { '#': 'white' });
    draw(c, ['##.', '#.#', '##.', '#.#', '##.'], 6, 6, { '#': 'white' });
    draw(c, ['.##', '#..', '#..', '#..', '.##'], 10, 6, { '#': 'white' });
  },
  rps: c => {
    disc(c, 5, 9, 4.5, 'black');
    disc(c, 5, 9, 3.5, 'fog');
    px(c, 4, 8, 'gray');
    rect(c, 11, 3, 10, 12, 'black');
    rect(c, 12, 4, 8, 10, 'paper');
    for (const y of [6, 8, 10]) line(c, 13, y, 18, y, 'gray');
    line(c, 23, 3, 30, 10, 'gray');
    line(c, 30, 3, 23, 10, 'gray');
    for (const x of [23, 29]) {
      disc(c, x + 1, 13, 2, 'red');
      px(c, x + 1, 13, null);
    }
  },
};
function icon(name) {
  const c = canvas(name === 'rps' ? 32 : 16, 16);
  ICONS[name](c);
  return c;
}

// --- Backgrounds (180x390) ---
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const DITHER_ROWS = 24;

function sky(c, bands, seed) {
  const bandH = Math.ceil(c.h / bands.length);
  bands.forEach((color, i) => rect(c, 0, i * bandH, c.w, bandH, color));
  // Bayer-dithered gradient across each band edge so bands blend instead of forming a line.
  for (let i = 1; i < bands.length; i++) {
    const start = i * bandH - DITHER_ROWS / 2;
    for (let y = start; y < start + DITHER_ROWS; y++) {
      const t = (y - start + 0.5) / DITHER_ROWS;
      for (let x = 0; x < c.w; x++) {
        px(c, x, y, BAYER[y % 4][x % 4] / 16 < t ? bands[i] : bands[i - 1]);
      }
    }
  }
  for (let k = 0; k < 90; k++) {
    const x = Math.floor(hash(k, 1, seed) * c.w);
    const y = Math.floor(hash(k, 2, seed) * c.h * 0.6);
    const big = hash(k, 3, seed) > 0.85;
    px(c, x, y, big ? 'white' : hash(k, 4, seed) > 0.5 ? 'fog' : 'steel');
    if (big) {
      px(c, x + 1, y, 'fog');
      px(c, x - 1, y, 'fog');
      px(c, x, y + 1, 'fog');
      px(c, x, y - 1, 'fog');
    }
  }
}
function defaultBackground() {
  const c = canvas(180, 390);
  sky(c, ['ink', 'ink', 'night', 'night', 'slate'], 1);
  disc(c, 140, 60, 12, 'paper');
  disc(c, 146, 56, 10, 'ink');
  for (let x = 0; x < c.w; x++) {
    const h1 = 330 + Math.round(Math.sin(x / 18) * 10 + Math.sin(x / 7) * 3);
    rect(c, x, h1, 1, c.h - h1, 'steel');
    const h2 = 352 + Math.round(Math.sin(x / 11 + 2) * 8);
    rect(c, x, h2, 1, c.h - h2, 'night');
  }
  return c;
}
function cityBackground() {
  const c = canvas(180, 390);
  sky(c, ['ink', 'night', 'navy', 'slate', 'maroon'], 2);
  let x = 0;
  let k = 0;
  while (x < c.w) {
    const w = 14 + Math.floor(hash(k, 9) * 18);
    const h = 50 + Math.floor(hash(k, 8) * 90);
    const top = c.h - h;
    rect(c, x, top, w - 2, h, 'black');
    for (let wy = top + 4; wy < c.h - 6; wy += 6) {
      for (let wx = x + 3; wx < x + w - 5; wx += 4) {
        if (hash(wx, wy, 5) > 0.55) {
          rect(c, wx, wy, 2, 3, hash(wx, wy, 6) > 0.3 ? 'yellow' : 'orange');
        }
      }
    }
    x += w;
    k++;
  }
  return c;
}

async function main() {
  await save(
    sheet(
      [0, 1, 2, 3].map(i => bombFrame(i, false)),
      4
    ),
    'bombIdle.png'
  );
  await save(
    sheet(
      [0, 1, 2, 3].map(i => bombFrame(i, true)),
      4
    ),
    'bombArmed.png'
  );
  await save(sheet([...Array(10).keys()].map(explosionFrame), 4), 'explosion.png');
  await save(sheet([...Array(10).keys()].map(coinFrame), 5), 'coin.png');
  await save(sheet([0, 1, 2, 3].map(loaderFrame), 4), 'loader.png');
  for (const name of Object.keys(ICONS)) await save(icon(name), `icons/${name}.png`);
  await save(defaultBackground(), 'backgrounds/default.png');
  await save(cityBackground(), 'backgrounds/city.png');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
