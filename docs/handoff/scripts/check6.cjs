const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 390, h: 844, n: 'm' }, { w: 1280, h: 860, n: 'd' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/');
    await p.evaluate(() => {
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      localStorage.setItem('prepplay:profile', JSON.stringify({ fullReading: [{ date: '2026-11-10', correct: 30, band: 7 }] }));
    });
    await p.goto('http://localhost:3000/#/ielts-full');
    await p.waitForTimeout(800);
    await p.screenshot({ path: S + `j-pick-${vp.n}.png`, fullPage: vp.n === 'm' });
    await p.click('[data-test="academic-5"]');
    await p.waitForTimeout(400);
    if (vp.n === 'm') await p.click('[data-view="qs"]');
    const pills = await p.$$('.full-pill');
    await pills[0].click();
    await p.screenshot({ path: S + `j-test5-${vp.n}.png` });
    await p.click('.full-finish >> nth=0');
    await p.waitForTimeout(700);
    await p.screenshot({ path: S + `j-res-${vp.n}.png` });
    await p.click('.full-list');
    await p.waitForTimeout(500);
    const done = await p.$$eval('.full-test.is-done', (x) => x.map((e) => e.dataset.test));
    console.log(vp.n, 'done tests', done, 'width', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.goto('http://localhost:3000/#/c/dtm');
    await p.waitForTimeout(400);
    await p.close();
  }
  await b.close();
})();
