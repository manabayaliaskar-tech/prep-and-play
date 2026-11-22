const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); const d = new Date(); const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 333, season: { id, pts: 1700, claimed: [1, 2, 3, 4, 5, 6, 7, 8, 9] } })); });
    await p.goto('http://localhost:3101/');
    await p.waitForTimeout(1500);
    const el = await p.$('.pass-card2');
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1500);
    await el.screenshot({ path: `${__dirname}/pc-${w}.png` });
    console.log(w, await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
