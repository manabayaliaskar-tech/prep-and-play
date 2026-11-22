const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      localStorage.removeItem('prepplay:pins');
      localStorage.removeItem('prepplay:profile');
      localStorage.setItem('prepplay:theme', JSON.stringify('night'));
    });
    await p.reload();
    await p.waitForTimeout(500);
    const names = () => p.$$eval('.daily-grid', (g) => [...g[0].querySelectorAll('.daily-course b')].map((x) => x.textContent));
    const before = await names();
    const badge = await p.$eval('.more-badge', (x) => x.textContent);
    await p.goto('http://localhost:3000/#/practice');
    await p.waitForTimeout(400);
    const pins = await p.$$('.pin-btn');
    await pins[8].click();
    await p.waitForTimeout(300);
    const pinned = await p.evaluate(() => localStorage.getItem('prepplay:pins'));
    await p.goto('http://localhost:3000/#/');
    await p.waitForTimeout(500);
    const after = await names();
    const blk = await p.$('.block:has(.daily-grid)');
    await blk.screenshot({ path: `shots/pins-${tag}.png` });
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'before', before, 'badge', badge, 'pins', pinned, 'after', after, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
