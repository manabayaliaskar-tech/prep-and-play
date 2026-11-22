const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      for (const k of ['chests', 'reportSeen', 'prepiWear', 'plan']) localStorage.removeItem('prepplay:' + k);
      const history = {};
      ['2026-11-09', '2026-11-10', '2026-11-12', '2026-11-13', '2026-11-15'].forEach((d, i) => (history[d] = { xp: 40 + i * 25, a: 10 + i * 3, c: 7 + i * 2 }));
      ['2026-11-03', '2026-11-05'].forEach((d) => (history[d] = { xp: 50, a: 10, c: 6 }));
      const profile = { xp: 420, streak: { count: 8, last: '2026-11-16', best: 8 }, history, skills: { 'm.add': { a: 6, c: 2 }, 'e.words': { a: 8, c: 4 } } };
      localStorage.setItem('prepplay:profile', JSON.stringify(profile));
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    });
    await p.reload();
    await p.waitForTimeout(600);
    const cards = await p.$$eval('.chest-card, .report-card', (x) => x.length);
    await (await p.$('.chest-card')).screenshot({ path: `shots/chest-card-${tag}.png` });
    await p.click('.chest-card');
    await p.waitForTimeout(300);
    await p.click('.chest-box');
    await p.waitForTimeout(900);
    await p.screenshot({ path: `shots/chest-open-${tag}.png` });
    await p.keyboard.press('Escape');
    await p.goto('http://localhost:3000/#/report');
    await p.waitForTimeout(900);
    await p.screenshot({ path: `shots/report-${tag}.png`, fullPage: true });
    // подсказка
    await p.goto('http://localhost:3000/#/c/geography/g2');
    await p.waitForTimeout(400);
    await p.click('.start-train');
    await p.waitForTimeout(500);
    await p.click('.hint-btn');
    await p.waitForTimeout(400);
    const elim = await p.$$eval('.choice.is-eliminated', (x) => x.length);
    await p.screenshot({ path: `shots/hint-${tag}.png` });
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'cards', cards, 'eliminated', elim, 'chests', await p.evaluate(() => localStorage.getItem('prepplay:chests')), 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
