const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, acceptDownloads: true });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      for (const k of ['outfit', 'prepiWear', 'wearKnown', 'reportSeen']) localStorage.removeItem('prepplay:' + k);
      localStorage.setItem('prepplay:chests', JSON.stringify([3, 7, 14, 30]));
      const history = { '2026-11-10': { xp: 60, a: 12, c: 9 }, '2026-11-12': { xp: 90, a: 15, c: 11 } };
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 2600, achievements: { first: 1, quizmaster: 1, century: 1, practice1: 1, streak7: 1 }, streak: { count: 4, last: '2026-11-16', best: 30 }, history }));
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    });
    await p.reload();
    await p.waitForTimeout(500);
    // Откроем гардероб с главной (Препи в приветствии)
    await p.click('.hero-mascot.prepi-dress');
    await p.waitForTimeout(400);
    await p.click('[data-item="wizard"]');
    await p.click('[data-slot="face"]');
    await p.click('[data-item="glasses"]');
    await p.click('[data-slot="neck"]');
    await p.click('[data-item="medal"]');
    await p.click('[data-slot="back"]');
    await p.click('[data-item="wings"]');
    await p.click('[data-slot="color"]');
    await p.click('[data-item="mint"]');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/wardrobe-${tag}.png` });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    await (await p.$('.hero-card')).screenshot({ path: `shots/hero-dressed-${tag}.png` });
    const outfit = await p.evaluate(() => localStorage.getItem('prepplay:outfit'));
    // Уведомление о новой вещи: добавим достижение и сохраним профиль
    await p.goto('http://localhost:3000/#/profile');
    await p.waitForTimeout(400);
    // Картинка отчёта
    let png = null;
    if (tag === 'd') {
      await p.goto('http://localhost:3000/#/report');
      await p.waitForTimeout(500);
      const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('.report-share')]);
      if (dl) {
        png = 'shots/report-share.png';
        await dl.saveAs(png);
      }
    }
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'outfit', outfit, 'share', png, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
