const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [820, 1180], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); const d = new Date(Date.now() - 86400000); const y = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 333, xp: 752, streak: { count: 3, last: y, best: 3 }, last: { course: 'sat' } })); });
    await p.goto('http://localhost:3101/');
    await p.waitForTimeout(3000);
    await p.screenshot({ path: `${__dirname}/hero4-${w}.png` });
    await p.click('.ts-quests'); await p.waitForTimeout(400);
    const el = await p.$('.ts-pop'); await el.scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${__dirname}/hero4-pop-${w}.png` });
    console.log(w, await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
