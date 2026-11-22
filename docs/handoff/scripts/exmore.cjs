const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/profile');
    await p.waitForTimeout(2000);
    const vis = () => p.$$eval('.exam-fold', (l) => l.filter((x) => x.offsetParent).length);
    const before = await vis();
    const btn = await p.$('.exam-more-btn');
    await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await p.screenshot({ path: `${__dirname}/exmore-${w}.png` });
    await btn.click(); await p.waitForTimeout(400);
    const after = await vis();
    await p.reload(); await p.waitForTimeout(1500);
    console.log(w, before, after, 'persist', await vis(), await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
