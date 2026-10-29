import fs from 'fs';
import path from 'path';

const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function readText(file: string): string {
  return fs.readFileSync(file, 'utf8');
}

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface WebManifest {
  id: string;
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  orientation: string;
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
  prefer_related_applications?: boolean;
}

describe('web export configuration', () => {
  it('uses Metro with static output and keeps the existing favicon', () => {
    const app = readJson<{
      expo: { web: Record<string, unknown>; experiments: Record<string, unknown> };
    }>(path.join(ROOT, 'app.json'));

    expect(app.expo.web.bundler).toBe('metro');
    expect(app.expo.web.output).toBe('static');
    expect(app.expo.web.favicon).toBe('./assets/favicon.png');
    expect(app.expo.experiments.baseUrl).toBe('/TicTacPartyPack');
  });
});

describe('web app manifest', () => {
  const manifestPath = path.join(PUBLIC, 'manifest.json');

  it('declares the stable identity and display contract', () => {
    const manifest = readJson<WebManifest>(manifestPath);

    expect(manifest.id).toBe('./');
    expect(manifest.name).toBe('TicTacPartyPack');
    expect(manifest.short_name).toBe('TicTac');
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
    expect(manifest.background_color).toBe('#0F0F1B');
    expect(manifest.theme_color).toBe('#0F0F1B');
    expect(manifest.prefer_related_applications).toBeUndefined();
  });

  it('lists relative icons so the manifest works at the GitHub Pages subpath', () => {
    const manifest = readJson<WebManifest>(manifestPath);

    expect(manifest.icons).toEqual([
      {
        src: './icons/pwa-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: './icons/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: './icons/pwa-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ]);
  });
});

describe('PWA icons', () => {
  it.each([
    ['public/icons/pwa-192.png', 192],
    ['public/icons/pwa-512.png', 512],
    ['public/icons/pwa-maskable-512.png', 512],
    ['public/apple-touch-icon.png', 180],
  ])('%s is a PNG with the declared dimensions', async (file, size) => {
    const { width, height, format } = await sharp(path.join(ROOT, file)).metadata();

    expect(format).toBe('png');
    expect(width).toBe(size);
    expect(height).toBe(size);
  });

  it.each(['public/icons/pwa-maskable-512.png', 'public/apple-touch-icon.png'])(
    '%s is opaque',
    async file => {
      const { isOpaque } = await sharp(path.join(ROOT, file)).stats();

      expect(isOpaque).toBe(true);
    }
  );
});

describe('root HTML document', () => {
  const source = () => readText(path.join(ROOT, 'app', '+html.tsx'));

  it('uses only the SDK 54 expo-router/html API', () => {
    const html = source();

    expect(html).toContain("from 'expo-router/html'");
    expect(html).toContain('ScrollViewStyleReset');
    expect(html).toContain('PropsWithChildren');
    expect(html).not.toContain('useServerDocumentContext');
    expect(html).toContain('<html lang="es">');
  });

  it('links the manifest, Apple metadata and initial background on every route', () => {
    const html = source();

    expect(html).toContain('rel="manifest"');
    expect(html).toContain("const baseUrl = process.env.EXPO_BASE_URL ?? '';");
    expect(html).toContain("href={basePath('/manifest.json')}");
    expect(html).toMatch(/name="theme-color"[\s\S]*#0F0F1B/);
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain("href={basePath('/apple-touch-icon.png')}");
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('apple-mobile-web-app-title');
    expect(html).toContain('#0F0F1B');
  });

  it('registers the worker only in production and never reloads on controllerchange', () => {
    const html = source();

    expect(html).toContain("process.env.NODE_ENV === 'production'");
    expect(html).toContain("navigator.serviceWorker.register('${basePath('/sw.js')}'");
    expect(html).toContain("scope: '${basePath('/')}'");
    expect(html).toContain("window.addEventListener('load'");
    expect(html).not.toContain('controllerchange');
  });
});
