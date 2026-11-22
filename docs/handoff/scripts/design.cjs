const { chromium } = require('playwright');
(async () => {
  const [,, theme = 'prep', routes = '/', w = '1280', h = '900', tag = ''] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
  await page.addInitScript((t) => {
    localStorage.setItem('prepplay:theme', JSON.stringify(t));
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
  }, theme);
  for (const r of routes.split(',')) {
    await page.goto('http://localhost:3000/#' + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const name = `shots/d-${theme}-${r.replace(/[^a-z0-9]+/gi, '_')}${tag}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log(name);
  }
  if (errors.length) console.log(errors.join('\n'));
  await browser.close();
})();
