const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 390, h: 844, n: 'm' }, { w: 1280, h: 860, n: 'd' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.n === 'm' ? 2 : 1 });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 200)));
    await p.goto('http://localhost:3000/');
    await p.evaluate(() => localStorage.setItem('prepplay:lang', JSON.stringify('ru')));
    await p.reload();
    await p.waitForSelector('.tour.is-in', { timeout: 5000 });
    const steps = await p.$$eval('.tour-dots i', (x) => x.length);
    for (let i = 0; i < steps; i++) {
      await p.waitForTimeout(950);
      if ([0, 1, 3, 4, 6, 10, steps - 1].includes(i)) await p.screenshot({ path: S + `t-${vp.n}-${i}.png` });
      const info = await p.evaluate(() => {
        const g = document.querySelector('.tour-guide').getBoundingClientRect();
        const h = document.querySelector('.tour-hole').getBoundingClientRect();
        return { title: document.querySelector('.tour-title').textContent, gTop: Math.round(g.top), gBottom: Math.round(g.bottom), gRight: Math.round(g.right), hole: [Math.round(h.top), Math.round(h.bottom)] };
      });
      const overlap = info.gBottom > info.hole[0] && info.gTop < info.hole[1] && info.hole[1] - info.hole[0] > 0;
      console.log(vp.n, i, info.title, overlap ? 'OVERLAP' : '', info.gRight > vp.w ? 'OUT-RIGHT' : '', JSON.stringify(info.hole));
      if (i < steps - 1) await p.click('.tour-next');
    }
    await p.click('.tour-next');
    await p.waitForTimeout(500);
    console.log(vp.n, 'closed', !(await p.$('.tour')), 'done flag', await p.evaluate(() => localStorage.getItem('prepplay:tourDone')), errs);
    await p.close();
  }
  await b.close();
})();
