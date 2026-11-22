const { chromium } = require('playwright');
(async () => {
  const [,, theme, route, sel, out, w = '1280'] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.log('PAGEERROR ' + e.message));
  await page.addInitScript((t) => { localStorage.setItem('prepplay:theme', JSON.stringify(t)); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); }, theme);
  await page.goto('http://localhost:3000/#' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1300);
  await page.locator(sel).first().screenshot({ path: out });
  await browser.close();
})();
