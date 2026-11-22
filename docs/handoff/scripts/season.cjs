const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      const d = new Date(); const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 2000, coins: 500, season: { id, pts: 1700, claimed: [1, 2, 3, 4, 5, 6, 7] }, achievements: { first: '2026-11-01' } }));
    });
    await p.reload();
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
    await (await p.$('.life-row')).screenshot({ path: `shots/season-card-${tag}.png` });
    await p.goto('http://localhost:3000/#/season');
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `shots/season-${tag}.png` }); await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(400); await p.screenshot({ path: `shots/season2-${tag}.png` });
    // забрать 8 (монеты), 9, потом 10 (вещь)
    await p.click('.tier[data-tier="8"] .tier-node');
    await p.waitForTimeout(600);
    await p.click('.tier[data-tier="9"] .tier-node');
    await p.waitForTimeout(600);
    await p.click('.tier[data-tier="10"] .tier-node');
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `shots/season-item-${tag}.png` });
    const prof = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')));
    const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(tag, prof.season.claimed, prof.seasonItems, prof.coins, o, errs);
    await p.close();
  }
  await b.close();
})();
