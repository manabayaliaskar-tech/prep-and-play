const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
    await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); const d = new Date(); const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 3000, season: { id, pts: 1700, claimed: [1, 2] } })); });
    await p.goto('http://localhost:3101/#/season');
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${__dirname}/pass-intro-${w}.png` });
    console.log('intro?', !!(await p.$('.pass-intro')), errs);
    await p.click('.pass-intro-go');
    await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('.pass-road').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${__dirname}/pass-${w}.png` });
    console.log(w, 'scroll', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
