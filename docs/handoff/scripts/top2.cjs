const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  await p.goto('http://localhost:3000/#/');
  await p.evaluate(() => localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 3000, coins: 12450, streak: { count: 132, last: '2026-11-16', best: 132 }, achievements: { first: 1, combo5: 1, combo15: 1 } })));
  await p.reload();
  await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  const r = await p.evaluate(() => [...document.querySelector('.topbar-inner').children].map((e) => `${e.className} ${getComputedStyle(e).display} ${Math.round(e.getBoundingClientRect().left)}-${Math.round(e.getBoundingClientRect().right)}`));
  await (await p.$('#topbar')).screenshot({ path: 'shots/top-360.png' });
  console.log(r);
  await b.close();
})();
