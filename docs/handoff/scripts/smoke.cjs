const { chromium } = require('playwright');
const routes = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 420, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  for (const r of routes) {
    await p.goto('http://localhost:3000/#' + r);
    await p.waitForTimeout(700);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    const h1 = await p.evaluate(() => document.querySelector('h1')?.textContent?.trim().slice(0, 60));
    console.log(r, 'width', w, '|', h1);
    await p.screenshot({ path: __dirname + '/s' + r.replace(/\//g, '_') + '.png', fullPage: false });
  }
  console.log('ERRORS', errs);
  await b.close();
})();
