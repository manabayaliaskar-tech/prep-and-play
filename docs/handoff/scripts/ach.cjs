const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      localStorage.setItem('prepplay:chests', JSON.stringify([3]));
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 2600, counters: { answered: 340, correct: 290, bestCombo: 12 },
        achievements: { first: '2026-11-01', century: '2026-11-10', streak3: '2026-11-12' }, streak: { count: 4, last: '2026-11-16', best: 9 },
        practice: { 'physics:p1': { runs: 2, best: 3 }, 'spanish:a1': { runs: 1, best: 2 } } }));
    });
    await p.goto('http://localhost:3000/#/profile');
    await p.reload();
    await p.waitForTimeout(900);
    const toasts = await p.$$eval('.toast', (t) => t.length);
    await p.screenshot({ path: `shots/ach-toast-${tag}.png` });
    await p.waitForTimeout(5600);
    const cards = await p.$$eval('.ach-panel .ach', (x) => x.length);
    await (await p.$('.ach-panel')).screenshot({ path: `shots/ach-panel-${tag}.png` });
    await p.click('.ach-all-link');
    await p.waitForTimeout(600);
    const all = await p.$$eval('.ach-page .ach', (x) => x.length);
    await p.screenshot({ path: `shots/ach-page-${tag}.png` });
    await p.click('[data-filter="earned"]');
    await p.waitForTimeout(200);
    const earned = await p.$$eval('.ach-page .ach', (x) => x.length);
    await p.click('[data-filter="all"]');
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const nav = await p.$eval('.is-active, [aria-current="page"]', (e) => e.textContent.trim()).catch(() => '?');
    console.log(tag, { toasts, cards, all, earned, o, nav }, errs);
    await p.close();
  }
  await b.close();
})();
