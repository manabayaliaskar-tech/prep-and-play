const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs=[];
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/#/premium'); await p.waitForTimeout(500);
  await p.screenshot({ path: process.argv[2] + '/prem.png', fullPage: true });
  await p.click('[data-lang="kk"]'); await p.waitForTimeout(200); console.log('kk:', await p.textContent('.premium-hero h1'));
  const m = await (await b.newContext({ ...devices['iPhone 13'] })).newPage(); m.on('pageerror', e => errs.push(e.message));
  await m.goto('http://localhost:8765/#/premium'); await m.waitForTimeout(400);
  console.log('mobile overflow:', await m.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await m.screenshot({ path: process.argv[2] + '/prem-m.png' });
  console.log('errors', errs); await b.close();
})();
