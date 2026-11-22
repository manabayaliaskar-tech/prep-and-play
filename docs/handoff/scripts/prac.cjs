const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [390, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/exams');
    await p.waitForTimeout(1200);
    const first = await p.$('.exam-list .practice-course');
    await first.scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    await p.screenshot({ path: __dirname + '/exam-' + w + '.png' });
    console.log(w, 'scroll', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
