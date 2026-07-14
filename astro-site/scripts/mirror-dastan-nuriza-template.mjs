import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/templates/dastan-nuriza');
const sourcePath = path.resolve('public/recovered-archive/dastannuriza/priglasiabakirova.tilda.ws/dastannuriza.html');
const referenceUrl = 'https://iman-almasbek-uulu.github.io/invitation-sites/recovered-archive/dastannuriza/priglasiabakirova.tilda.ws/dastannuriza.html';
const resourceTypes = new Set(['stylesheet', 'script', 'image', 'font', 'media']);
const captured = new Map();

function filenameFor(url, contentType = '') {
  const { pathname } = new URL(url);
  const extension = path.extname(pathname) || (
    contentType.includes('text/css') ? '.css' :
    contentType.includes('javascript') ? '.js' :
    contentType.includes('font') ? '.woff2' :
    contentType.includes('svg') ? '.svg' :
    contentType.includes('png') ? '.png' :
    contentType.includes('jpeg') ? '.jpg' :
    contentType.includes('audio') ? '.mp3' : '.bin'
  );
  return `${createHash('sha256').update(url).digest('hex').slice(0, 20)}${extension}`;
}

async function capture(viewport) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  page.on('response', async (response) => {
    const request = response.request();
    const url = response.url();
    if (!resourceTypes.has(request.resourceType()) || !/^https?:\/\//.test(url)) return;
    try {
      const body = await response.body();
      if (body.length) captured.set(url, { body, contentType: response.headers()['content-type'] || '' });
    } catch { /* non-essential failed/opaque responses are intentionally omitted */ }
  });
  try {
    await page.goto(referenceUrl, { waitUntil: 'networkidle', timeout: 90_000 });
    for (let y = 0; y < 3600; y += 600) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(450);
    }
    await page.waitForTimeout(2500);
  } finally {
    await browser.close();
  }
}

const source = await readFile(sourcePath, 'utf8');

await rm(root, { recursive: true, force: true });
await mkdir(path.join(root, 'assets'), { recursive: true });
await Promise.all([capture({ width: 1280, height: 844 }), capture({ width: 390, height: 844 })]);

// Mirror every declared visual asset. Archive endpoints/credits are not assets and
// are disabled below rather than copied.
const staticUrls = new Set((source.match(/https?:\/\/[^"'\s<>\\)]+/g) || [])
  .map((url) => url.replace(/&amp;/g, '&'))
  .filter((url) => {
    const host = new URL(url).hostname;
    return !/(^|\\.)tilda\.cc$|(^|\\.)tildaapi\.one$|(^|\\.)tilda\.ws$|^ws\\.tildacdn\.com$/i.test(host);
  }));
for (const url of staticUrls) {
  if (captured.has(url)) continue;
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.warn(`Skipping non-asset URL ${url}: ${error.cause?.code || error.message}`);
    continue;
  }
  if (!response.ok) {
    console.warn(`Skipping unavailable URL ${url}: ${response.status}`);
    continue;
  }
  const body = Buffer.from(await response.arrayBuffer());
  captured.set(url, { body, contentType: response.headers.get('content-type') || '' });
}

// CSS supplied by Tilda can contain a second-level font URL. Resolve those too;
// otherwise an apparently local stylesheet still causes a browser to contact Google.
for (const asset of [...captured.values()]) {
  if (!/css|javascript|text\//i.test(asset.contentType)) continue;
  for (const raw of asset.body.toString('utf8').match(/https?:\/\/[^"'\s<>\\)]+/g) || []) {
    const url = raw.replaceAll('&amp;', '&');
    if (captured.has(url) || /(?:tilda\.cc|tilda\.ws|tildaapi|forms\.tildacdn)/i.test(url)) continue;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      captured.set(url, { body: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get('content-type') || '' });
    } catch { /* External navigation URLs are deliberately not mirrored. */ }
  }
}

const replacements = new Map();
for (const [url, asset] of captured) {
  const file = filenameFor(url, asset.contentType);
  await writeFile(path.join(root, 'assets', file), asset.body);
  replacements.set(url, `assets/${file}`);
}

const rewrite = (text) => {
  let result = text;
  for (const [remote, local] of replacements) {
    result = result.split(remote).join(local);
    result = result.split(remote.replaceAll('&', '&amp;')).join(local);
  }
  return result;
};

for (const [url, asset] of captured) {
  if (!asset.contentType.includes('text/css')) continue;
  await writeFile(path.join(root, replacements.get(url)), rewrite(asset.body.toString('utf8')));
}

const isolation = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; frame-src 'self';">\n<script>\n(() => {\n  const blocked = /(^|\\.)tilda(?:cdn|api)?\\.(?:one|cc|ws)$/i;\n  const isBlocked = (value) => { try { return blocked.test(new URL(String(value), location.href).hostname); } catch { return false; } };\n  const originalBeacon = navigator.sendBeacon?.bind(navigator);\n  if (originalBeacon) navigator.sendBeacon = (url, body) => isBlocked(url) ? true : originalBeacon(url, body);\n  const originalFetch = window.fetch?.bind(window);\n  if (originalFetch) window.fetch = (input, init) => isBlocked(input instanceof Request ? input.url : input) ? Promise.resolve(new Response('', { status: 204 })) : originalFetch(input, init);\n  const originalOpen = XMLHttpRequest.prototype.open;\n  XMLHttpRequest.prototype.open = function(method, url, ...args) {\n    return originalOpen.call(this, method, isBlocked(url) ? '/blocked-external-request' : url, ...args);\n  };\n})();\n</script>`;
const interception = `<script>\n(() => {\n  const isTilda = (value) => { try { return /(^|\\.)tilda(?:cdn|api)?\\.(?:one|cc|ws)$/i.test(new URL(String(value), location.href).hostname); } catch { return false; } };\n  for (const [proto, property] of [[HTMLScriptElement.prototype, 'src'], [HTMLLinkElement.prototype, 'href'], [HTMLImageElement.prototype, 'src']]) {\n    const descriptor = Object.getOwnPropertyDescriptor(proto, property);\n    if (!descriptor?.set) continue;\n    Object.defineProperty(proto, property, { configurable: true, get: descriptor.get, set(value) {\n      if (isTilda(value)) { this.dataset.blockedExternal = String(value); return descriptor.set.call(this, ''); }\n      return descriptor.set.call(this, value);\n    }});\n  }\n  const originalSetAttribute = Element.prototype.setAttribute;\n  Element.prototype.setAttribute = function(name, value) {\n    if ((name === 'src' || name === 'href') && (this instanceof HTMLScriptElement || this instanceof HTMLLinkElement || this instanceof HTMLImageElement) && isTilda(value)) {\n      this.dataset.blockedExternal = String(value); return;\n    }\n    return originalSetAttribute.call(this, name, value);\n  };\n})();\n</script>`;
const rsvpGuard = `<script>\n(() => {\n  const canSubmit = (form) => Boolean(form?.dataset?.rsvpEndpoint);\n  document.addEventListener('submit', (event) => {\n    if (!canSubmit(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }\n  }, true);\n  const originalSubmit = HTMLFormElement.prototype.submit;\n  HTMLFormElement.prototype.submit = function() { if (canSubmit(this)) return originalSubmit.call(this); };\n})();\n</script>`;
const html = rewrite(source)
  .replace(/<base\b[^>]*>/gi, '')
  .replace(/<head>/i, `<head>\n${isolation}\n${interception}\n${rsvpGuard}`)
  .replace(/https:\/\/iman-almasbek-uulu\.github\.io\/invitation-sites\/recovered-archive\/dastannuriza\/priglasiabakirova\.tilda\.ws\/dastannuriza\.html#/g, '#')
  // The archived Tilda form endpoint is deliberately disabled until a first-party
  // request handler is configured for this template.
  .replace(/action=(['"])https?:\/\/[^'"]*tildacdn[^'"]*\1/gi, 'action="#" data-rsvp-endpoint=""')
  .replaceAll('https://ws.tildacdn.com', 'https://archive.invalid')
  .replaceAll('https://tilda.cc/', '#');
await writeFile(path.join(root, 'index.html'), html);
await writeFile(path.join(root, 'mirror-manifest.json'), JSON.stringify({
  source: referenceUrl,
  resources: Object.fromEntries(replacements),
}, null, 2));
console.log(JSON.stringify({ output: root, resources: replacements.size }, null, 2));
