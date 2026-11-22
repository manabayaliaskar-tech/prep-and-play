const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [820, 1180], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    for (const r of ['exams']) {
      await p.goto('http://localhost:3101/#/' + r);
      await p.waitForTimeout(1500);
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(800);
      await p.screenshot({ path: __dirname + '/desk-' + r + '-' + w + '.png' });
    }
    console.log(w, 'scroll', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
