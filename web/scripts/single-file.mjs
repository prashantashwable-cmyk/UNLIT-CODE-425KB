// Builds a portable, single-file copy of the web app: one HTML file with scripts, styles and fonts inlined, and
// in-memory navigation, so it opens from a phone's Downloads (no server) or as a hosted page.
// Usage: npm run build:single  ->  web/dist-single/aiec-demo.html (full document) and aiec-demo.page.html (body-only
// variant for hosts that add their own document skeleton).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist-single');
execFileSync('npx', ['vite', 'build', '--outDir', out, '--base', './', '--emptyOutDir'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, VITE_ROUTER: 'memory' },
});

const assets = join(out, 'assets');
const mime = { woff2: 'font/woff2', woff: 'font/woff', svg: 'image/svg+xml', png: 'image/png' };
const dataUri = (file) => `data:${mime[file.split('.').pop()] ?? 'application/octet-stream'};base64,${readFileSync(join(assets, file)).toString('base64')}`;

let html = readFileSync(join(out, 'index.html'), 'utf8');
const cssFile = readdirSync(assets).find((f) => f.endsWith('.css'));
const jsFile = readdirSync(assets).find((f) => f.endsWith('.js'));
// Only woff2 is kept: every phone browser in scope reads it, and it halves the size.
let css = readFileSync(join(assets, cssFile), 'utf8')
  .replace(/,\s*url\(\.\/[^)]+\.woff\)\s*format\(["']woff["']\)/g, '')
  .replace(/url\(\.\/([^)]+\.woff2)\)/g, (_, f) => `url(${dataUri(f)})`);
const js = readFileSync(join(assets, jsFile), 'utf8').replace(/<\/script/gi, '<\\/script');

html = html
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, () => `<script type="module">${js}</script>`)
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
           '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />');
if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('an asset was not inlined');
writeFileSync(join(out, 'aiec-demo.html'), html);

// Body-only variant: title + meta + style + root + script, no <!doctype>/<html>/<head>/<body>.
const title = html.match(/<title>.*?<\/title>/)[0];
const page = `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>${css}</style>\n<div id="root"></div>\n<script type="module">${js}</script>\n`;
writeFileSync(join(out, 'aiec-demo.page.html'), page);
console.log(`single file: ${(html.length / 1024).toFixed(0)} KB -> ${join(out, 'aiec-demo.html')}`);
