const { chromium } = require('playwright');
const k = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
(async () => {
  const b = await chromium.launch();
  const today = k(new Date());
  const ago = (n) => k(new Date(Date.now() - n * 86400000));
  const cases = {
    rescue: { xp: 900, coins: 300, streak: { count: 12, last: ago(2), best: 12 } },
    gift: { xp: 900, coins: 300, streak: { count: 120, last: today, best: 120 }, today: { date: today, xp: 80, answered: 8, correct: 7 } },
    sleep: { xp: 900, coins: 300, streak: { count: 3, last: ago(9), best: 3 } },
  };
  for (const [name, prof] of Object.entries(cases)) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate((prof) => { localStorage.clear(); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:profile', JSON.stringify(prof)); }, prof);
    await p.reload();
    await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
    await p.screenshot({ path: `shots/life-${name}.png`, fullPage: false, clip: { x: 0, y: 0, width: 390, height: 1100 } }).catch(async () => p.screenshot({ path: `shots/life-${name}.png` }));
    if (name === 'gift') {
      await p.click('.gift-card');
      await p.waitForTimeout(400);
      console.log('coins after gift', await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).coins), 'card gone', !(await p.$('.gift-card')));
    }
    const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, o, errs);
    await p.close();
  }
  await b.close();
})();
