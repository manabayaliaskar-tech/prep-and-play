const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.stack));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      const k = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      const now = new Date(); const ago = (n) => k(new Date(Date.now() - n * 86400000));
      localStorage.setItem('prepplay:plan', JSON.stringify({ course: 'ent', date: '2027-06-01', created: ago(3) }));
      localStorage.setItem('prepplay:mistakes', JSON.stringify([]));
      localStorage.setItem('prepplay:cards', JSON.stringify({ 'es:1': { s: 1, d: ago(1) }, 'es:2': { s: 0, d: ago(0) } }));
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 800, coins: 100, streak: { count: 3, last: ago(1), best: 3 },
        skills: { 'm.pct': { a: 10, c: 3 }, 'h.kz': { a: 8, c: 4 }, 'm.prob': { a: 6, c: 2 } },
        practice: { 'ent:mathlit': { runs: 1, best: 1, pct: 40 } }, last: { course: 'ent', track: 'mathlit' },
        mocks: [
          { exam: 'ent', date: ago(40), short: false, score: 58, max: 140, unit: 'points' },
          { exam: 'ent', date: ago(30), short: true, score: 61, max: 140, unit: 'points' },
          { exam: 'ent', date: ago(21), short: false, score: 63, max: 140, unit: 'points' },
          { exam: 'ent', date: ago(12), short: false, score: 66.5, max: 140, unit: 'points' },
          { exam: 'ent', date: ago(9), short: false, score: 64, max: 140, unit: 'points' },
        ] }));
    });
    await p.reload();
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
    console.log('errs', errs, await p.evaluate(() => document.querySelector('.today-card') ? 'card' : document.querySelector('#app').innerHTML.slice(0,300)));
    await (await p.$('.today-card')).screenshot({ path: `shots/today-card-${tag}.png` });
    await p.click('.today-card');
    await p.waitForTimeout(1000);
    await p.screenshot({ path: `shots/today-${tag}.png`, fullPage: true });
    await p.click('.today-start');
    await p.waitForTimeout(400);
    const total = await p.$eval('.q-counter', (e) => e.textContent).catch(() => '?');
    await p.goto('http://localhost:3000/#/mock/ent');
    await p.waitForTimeout(1200);
    const pp = await p.$('.mock-progress-panel');
    await p.hover('.chart-pt[data-i="3"]').catch(() => {});
    await p.waitForTimeout(200);
    if (pp) await pp.screenshot({ path: `shots/progress-${tag}.png` });
    const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(tag, total, Boolean(pp), o, errs);
    await p.close();
  }
  await b.close();
})();
