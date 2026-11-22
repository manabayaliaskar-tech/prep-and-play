const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [name, streak] of [['buff', { count: 9, last: 'TODAY' }], ['rip', { count: 9, last: '2026-11-01' }]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/');
    await p.waitForTimeout(500);
    const key = 'prepplay:profile';
    await p.evaluate(([key, streak]) => {
      const pr = JSON.parse(localStorage.getItem(key) || '{}');
      const d = new Date(); const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      pr.streak = { ...streak, last: streak.last === 'TODAY' ? today : streak.last, best: 9 };
      pr.today = { date: streak.last === 'TODAY' ? today : streak.last, xp: streak.last === 'TODAY' ? 30 : 0, answered: 3, correct: 3 };
      localStorage.setItem(key, JSON.stringify(pr));
    }, [key, streak]);
    await p.reload();
    await p.waitForTimeout(6500);
    await p.screenshot({ path: `${__dirname}/hub-${name}.png`, clip: { x: 0, y: 60, width: 390, height: 420 } });
    await p.click('.prepi-poke');
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${__dirname}/hub-${name}-poke.png`, clip: { x: 0, y: 60, width: 390, height: 420 } });
    console.log(name, key, errs);
    await p.close();
  }
  await b.close();
})();
