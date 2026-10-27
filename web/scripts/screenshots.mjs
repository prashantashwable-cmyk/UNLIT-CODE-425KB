// Drives the built app (vite preview) with Playwright and saves a screenshot of every screen.
// Usage: npm run build && npm run screenshots   (output: web/screenshots/, git-ignored)
// Fails if any page logs a console error or shows a missing-translation marker (⟦key⟧).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

// Uses the pre-installed Playwright (resolved like require(), so a global install works; not a project dependency).
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = 'http://localhost:4173';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: new URL('..', import.meta.url).pathname, detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* already gone */ } };
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview did not start')), 20000);
  server.stdout.on('data', (d) => { if (String(d).includes('4173')) { clearTimeout(t); resolve(); } });
});

const problems = [];
const browser = await chromium.launch();

async function session(lang, viewport, phone, role, shots) {
  const page = await browser.newPage({ viewport });
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`${lang} ${m.text()}`); });
  await page.goto(BASE);
  await page.evaluate((l) => localStorage.setItem('aiec.lang', JSON.stringify(l)), lang);
  await page.goto(`${BASE}/login`);
  await page.locator('input[autocomplete="tel"]').fill(phone);
  await page.locator('.card .btn-primary').first().click();
  await page.locator('input[autocomplete="one-time-code"]').fill('123456');
  await page.locator('.card .btn-primary').first().click();
  if (role) await page.getByRole('button', { name: role }).click();
  for (const [name, path, action] of shots) {
    if (path) await page.goto(`${BASE}${path}`).catch(() => {});
    // client-side navigation keeps the session (state is in memory, like a real app session)
    if (action) await action(page);
    await page.waitForTimeout(250);
    const text = await page.locator('body').innerText();
    if (text.includes('⟦')) problems.push(`${lang}/${name}: missing translation`);
    await page.screenshot({ path: `${OUT}${lang}-${viewport.width}-${name}.png`, fullPage: true });
  }
  await page.close();
}

const nav = (label) => async (p) => p.locator('.bottomnav a').nth(label).click();
const mobile = { width: 360, height: 780 };   // T-093: 360 px phones
const desktop = { width: 1280, height: 860 };

// Entry screens (no login)
for (const lang of ['mr', 'hi', 'en']) {
  const page = await browser.newPage({ viewport: mobile });
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`${lang} ${m.text()}`); });
  await page.goto(BASE);
  if (lang !== 'mr') await page.evaluate((l) => localStorage.setItem('aiec.lang', JSON.stringify(l)), lang);
  await page.goto(`${BASE}/start`);
  await page.screenshot({ path: `${OUT}${lang}-360-00-start.png`, fullPage: true });
  await page.goto(`${BASE}/language`);
  await page.screenshot({ path: `${OUT}${lang}-360-01-language.png`, fullPage: true });
  await page.goto(`${BASE}/login`);
  await page.screenshot({ path: `${OUT}${lang}-360-02-login.png`, fullPage: true });
  await page.close();
}

for (const lang of ['mr', 'hi', 'en']) {
  for (const vp of [mobile, desktop]) {
    await session(lang, vp, '9800000002', null, [
      ['03-admin-queue', null, null],
      ['04-approvals', null, async (p) => p.locator('a[href="/admin/approvals"]').first().click()],
      ['05-project-file', null, async (p) => { await nav(0)(p); await p.locator('.list-item').first().click(); }],
      ['06-chat-thread', null, async (p) => { await nav(2)(p); await p.locator('.list-item').nth(2).click(); }],
      ['06b-money', null, nav(3)],
      ['07-me', null, nav(4)],
      ['07b-analytics', null, nav(5)],
      ['07c-rules', null, async (p) => { await nav(4)(p); await p.locator('a[href="/admin/rules"]').click(); }],
    ]);
  }
  await session(lang, mobile, '9800000021', null, [['08-customer-progress', null, null], ['08b-customer-money', null, nav(3)],
    ['08c-customer-chat', null, async (p) => { await nav(2)(p); await p.locator('.list-item').first().click(); }]]);
  await session(lang, desktop, '9800000009', null, [['09-owner-decisions', null, null], ['09b-owner-summary', null, nav(5)]]);
  await session(lang, mobile, '9800000031', null, [['10-field-role-refused', null, null]]);
}

// Outdoor (high-contrast) theme check
{
  const page = await browser.newPage({ viewport: mobile });
  await page.goto(BASE);
  await page.evaluate(() => { localStorage.setItem('aiec.lang', '"mr"'); localStorage.setItem('aiec.theme', '"outdoor"'); });
  await page.goto(`${BASE}/login`);
  await page.locator('input[autocomplete="tel"]').fill('9800000021');
  await page.locator('.card .btn-primary').first().click();
  await page.locator('input[autocomplete="one-time-code"]').fill('123456');
  await page.locator('.card .btn-primary').first().click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}mr-360-11-outdoor-theme.png`, fullPage: true });
  await page.close();
}

await browser.close();
stop();
if (problems.length) {
  console.error('PROBLEMS:\n' + problems.join('\n'));
  stop();
  process.exit(1);
}
console.log(`screenshots written to ${OUT}`);
process.exit(0);
