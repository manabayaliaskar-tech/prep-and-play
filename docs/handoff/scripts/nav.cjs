const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    for (let i = 0; i < 3; i++) { await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(200); await p.goto('http://localhost:3101/#/saved'); await p.waitForTimeout(300); }
    const tip = !!(await p.$('.notes-tip'));
    await p.click('.notes-add');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${__dirname}/nav-${w}.png`, clip: w > 500 ? { x: 0, y: 0, width: w, height: 160 } : { x: 0, y: h - 80, width: w, height: 80 } });
    console.log(w, 'tip', tip, 'notes in nav', !!(await p.$('.nav a[href="#/saved"]')), 'scroll', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
