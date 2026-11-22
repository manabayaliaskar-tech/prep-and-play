const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1180, 820, 'ipad'], [390, 844, 'm'], [1366, 900, 'd']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      const skills = { 'm.add': { a: 12, c: 9 }, 'm.frac': { a: 8, c: 5 }, 'e.words': { a: 10, c: 6 }, 'g.world': { a: 9, c: 8 }, 'b.animals': { a: 6, c: 3 }, 'p.kin': { a: 5, c: 2 }, 'h.kzt': { a: 7, c: 5 }, 'es.words': { a: 6, c: 4 }, 'py.vars': { a: 4, c: 3 } };
      const practice = { 'ent:mathlit': { best: 2, runs: 1, pct: 70, last: '2026-11-16' }, 'ent:history': { best: 1, runs: 1, pct: 50, last: '2026-11-16' }, 'math:g3': { best: 3, runs: 2, pct: 100, last: '2026-11-15', boss: true } };
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 640, skills, practice, streak: { count: 3, last: '2026-11-16', best: 5 }, today: { date: '2026-11-16', xp: 80, answered: 20, correct: 14, quests: {} }, history: { '2026-11-16': { xp: 0, a: 0, c: 0 } } }));
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    });
    await p.goto('http://localhost:3000/#/profile');
    await p.reload();
    await p.waitForTimeout(700);
    const folds = await p.$$eval('.exam-fold', (x) => x.length);
    const open = await p.$$eval('.exam-fold[open]', (x) => x.length);
    await p.screenshot({ path: `shots/prof-${tag}.png`, fullPage: true });
    await p.click('.exam-fold summary');
    await p.waitForTimeout(300);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'folds', folds, 'openByDefault', open, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
