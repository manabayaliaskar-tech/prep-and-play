const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [820, 1180], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); const d = new Date(Date.now() - 86400000); const y = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 333, xp: 697, streak: { count: 2, last: y, best: 2 }, last: { course: 'sat' } })); });
    await p.goto('http://localhost:3101/');
    await p.waitForTimeout(3000);
    const el = await p.$('.today-strip'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await p.screenshot({ path: `${__dirname}/strip-${w}.png` });
    console.log(w, await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
