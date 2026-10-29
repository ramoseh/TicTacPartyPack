#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { getManifest, generateSW } = require('workbox-build');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const SW_DEST = path.join(DIST_DIR, 'sw.js');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const GLOB_IGNORES = ['**/sw.js', '**/workbox-*.js', '**/*.map', '_expo/.routes.json'];

const REQUIRED_FILES = [
  'index.html',
  'game/index.html',
  'game/config.html',
  'settings/index.html',
  'manifest.json',
  'icons/pwa-192.png',
  'icons/pwa-512.png',
  'icons/pwa-maskable-512.png',
  'apple-touch-icon.png',
];

const REQUIRED_PATTERNS = [
  ['web JS bundle', /^_expo\/static\/js\/web\/.+\.js$/],
  ['web CSS bundle', /^_expo\/static\/css\/.+\.css$/],
  ['font asset', /\.ttf$/],
  ['image asset', /^assets\/.+\.png$/],
  ['tick sound', /^assets\/assets\/sounds\/tick\..*\.mp3$/],
  ['explosion sound', /^assets\/assets\/sounds\/explode\..*\.mp3$/],
];

const REQUIRED_ROUTES = [
  { url: '/', document: 'index.html' },
  { url: '/game', document: 'index.html' },
  { url: '/game/', document: 'game/index.html' },
  { url: '/game/config', document: 'game/config.html' },
  { url: '/game/config/', document: 'index.html' },
  { url: '/settings', document: 'index.html' },
  { url: '/settings/', document: 'settings/index.html' },
  { url: '/_sitemap', document: '_sitemap.html' },
  { url: '/+not-found', document: '+not-found.html' },
  { url: '/game?simpleMode=true', document: 'index.html' },
  { url: '/game?allowedTypes=CoinFlip', document: 'index.html' },
];

// Workbox matches navigations against precached relative URLs: exact path,
// directoryIndex for trailing slashes, then clean URLs, and finally the
// navigateFallback. Non-utm query parameters prevent direct matches.
const WORKBOX_OPTIONS = {
  globPatterns: ['**/*'],
  globIgnores: GLOB_IGNORES,
  navigateFallback: 'index.html',
  cleanupOutdatedCaches: true,
  skipWaiting: false,
  clientsClaim: false,
  inlineWorkboxRuntime: true,
  sourcemap: false,
  maximumFileSizeToCacheInBytes: MAX_FILE_SIZE,
  dontCacheBustURLsMatching: /[.-][a-f0-9]{32}\./i,
};

// getManifest() only accepts manifest-related options; navigateFallback and the
// lifecycle flags belong to generateSW().
const MANIFEST_OPTIONS = {
  globPatterns: WORKBOX_OPTIONS.globPatterns,
  globIgnores: WORKBOX_OPTIONS.globIgnores,
  maximumFileSizeToCacheInBytes: WORKBOX_OPTIONS.maximumFileSizeToCacheInBytes,
  dontCacheBustURLsMatching: WORKBOX_OPTIONS.dontCacheBustURLsMatching,
};

function toPosix(file) {
  return file.split(path.sep).join('/');
}

function isExcludedFromPrecache(file) {
  const normalized = toPosix(file);
  if (normalized === '_expo/.routes.json') return true;
  if (normalized.endsWith('.map')) return true;
  const base = normalized.split('/').pop();
  return base === 'sw.js' || /^workbox-.*\.js$/.test(base);
}

function collectFiles(directory) {
  const files = [];
  const visit = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else files.push(toPosix(path.relative(directory, full)));
    }
  };
  visit(directory);
  return files.sort();
}

function resolveDocument(url, entryUrls) {
  const parsed = new URL(url, 'http://localhost');
  const hasBlockingQuery = [...parsed.searchParams.keys()].some(key => !key.startsWith('utm_'));
  if (hasBlockingQuery) return WORKBOX_OPTIONS.navigateFallback;

  const pathname = decodeURIComponent(parsed.pathname);
  const relative = pathname.replace(/^\//, '');

  if (relative && entryUrls.has(relative)) return relative;

  if (pathname.endsWith('/')) {
    const directoryIndex = `${relative}index.html`;
    if (entryUrls.has(directoryIndex)) return directoryIndex;
  }

  const cleanUrl = `${relative}.html`;
  if (entryUrls.has(cleanUrl)) return cleanUrl;

  return WORKBOX_OPTIONS.navigateFallback;
}

function validatePrecache({
  entries,
  warnings = [],
  files,
  requiredFiles = REQUIRED_FILES,
  requiredPatterns = REQUIRED_PATTERNS,
  routes = REQUIRED_ROUTES,
}) {
  const errors = [];
  const urls = entries.map(entry => entry.url);
  const urlSet = new Set(urls);

  warnings.forEach(warning => errors.push(`Workbox warning: ${warning}`));

  entries.forEach(entry => {
    if (entry.url.startsWith('/') || entry.url.includes('://') || entry.url.includes('..')) {
      errors.push(`Precache URL must be relative to the deployment root: ${entry.url}`);
    }
    if (typeof entry.size === 'number' && entry.size > MAX_FILE_SIZE) {
      errors.push(`Precached file exceeds ${MAX_FILE_SIZE} bytes: ${entry.url}`);
    }
  });

  requiredFiles.forEach(file => {
    if (!urlSet.has(file)) errors.push(`Required file is missing from the precache: ${file}`);
  });

  requiredPatterns.forEach(([label, pattern]) => {
    if (!urls.some(url => pattern.test(url))) {
      errors.push(`No ${label} was found in the precache`);
    }
  });

  files
    .filter(file => !isExcludedFromPrecache(file))
    .forEach(file => {
      if (!urlSet.has(file)) errors.push(`Export file is not covered by the precache: ${file}`);
    });

  if (!urlSet.has(WORKBOX_OPTIONS.navigateFallback)) {
    errors.push(
      `Navigation fallback is missing from the precache: ${WORKBOX_OPTIONS.navigateFallback}`
    );
  }

  routes.forEach(route => {
    const document = resolveDocument(route.url, urlSet);
    if (document !== route.document) {
      errors.push(`Route ${route.url} resolves to ${document}, expected ${route.document}`);
    }
  });

  return errors;
}

function validateHtml(documents) {
  const errors = [];
  documents.forEach(({ file, content }) => {
    if (!content.includes('rel="manifest"') || !content.includes('href="/manifest.json"')) {
      errors.push(`${file}: missing manifest link`);
    }
    if (!/navigator\.serviceWorker\.register\(\s*['"]\/sw\.js['"]/.test(content)) {
      errors.push(`${file}: missing production service worker registration`);
    }
    if (content.includes('controllerchange')) {
      errors.push(`${file}: controllerchange must not trigger reloads`);
    }
  });
  return errors;
}

function validateReferences(documents, files) {
  const fileSet = new Set(files);
  const errors = [];
  documents.forEach(({ file, content }) => {
    const references = [...content.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css))"/g)].map(
      match => match[1]
    );
    references.forEach(reference => {
      const relative = decodeURIComponent(reference.slice(1));
      if (!fileSet.has(relative)) {
        errors.push(`${file}: referenced asset does not exist: ${reference}`);
      }
    });
  });
  return errors;
}

function readHtmlDocuments(files) {
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      file,
      content: fs.readFileSync(path.join(DIST_DIR, file), 'utf8'),
    }));
}

async function main() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    throw new Error('dist/index.html not found; run `expo export -p web` first');
  }

  const files = collectFiles(DIST_DIR);
  if (files.some(isExcludedFromPrecache)) {
    // Worker artifacts may exist from a previous build; remove stale sw.js so it
    // is never part of the coverage check or served alongside a new precache.
    if (fs.existsSync(SW_DEST)) fs.rmSync(SW_DEST);
  }

  const manifest = await getManifest({
    globDirectory: DIST_DIR,
    ...MANIFEST_OPTIONS,
  });
  const documents = readHtmlDocuments(files);
  const errors = [
    ...validatePrecache({
      entries: manifest.manifestEntries,
      warnings: manifest.warnings,
      files,
    }),
    ...validateHtml(documents),
    ...validateReferences(documents, files),
  ];

  if (errors.length > 0) {
    errors.forEach(error => console.error(`PWA build error: ${error}`));
    throw new Error(`PWA precache validation failed with ${errors.length} error(s)`);
  }

  const result = await generateSW({
    globDirectory: DIST_DIR,
    swDest: SW_DEST,
    ...WORKBOX_OPTIONS,
  });

  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => console.error(`Workbox warning: ${warning}`));
    throw new Error('Workbox reported warnings; refusing to publish a partial precache');
  }

  const serviceWorker = fs.readFileSync(SW_DEST, 'utf8');
  if (
    !serviceWorker.includes('index.html') ||
    !serviceWorker.includes('precache') ||
    !serviceWorker.includes('addEventListener("install"')
  ) {
    throw new Error('Generated service worker does not contain the expected precache');
  }

  console.log(
    `PWA precache: ${manifest.count} entries, ${(manifest.size / 1024 / 1024).toFixed(2)} MiB`
  );
  console.log('PWA build: dist/sw.js generated');
}

module.exports = {
  WORKBOX_OPTIONS,
  GLOB_IGNORES,
  MAX_FILE_SIZE,
  REQUIRED_FILES,
  REQUIRED_ROUTES,
  collectFiles,
  isExcludedFromPrecache,
  resolveDocument,
  validatePrecache,
  validateHtml,
  validateReferences,
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
