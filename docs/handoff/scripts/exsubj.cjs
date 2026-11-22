const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/explain');
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${__dirname}/exsubj-${w}.png` });
    await p.click('.explain-chip[data-subj="geometry"]'); await p.waitForTimeout(500);
    const n = await p.$$eval('.explain-card', (l) => l.length);
    await p.screenshot({ path: `${__dirname}/exsubj-geo-${w}.png` });
    console.log(w, n, await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.evaluate(() => localStorage.removeItem('prepplay:explainSubj'));
    await p.close();
  }
  await b.close();
})();
