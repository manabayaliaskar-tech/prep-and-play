const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [320, 360, 390, 430]) {
    const p = await b.newPage({ viewport: { width: w, height: 700 } });
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 3000, coins: 12450, streak: { count: 132, last: '2026-11-16', best: 132 } })));
    await p.reload();
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => [...document.querySelectorAll('#topbar *')].filter((e) => !e.closest('svg') && e.getBoundingClientRect().right > innerWidth + 1).map((e) => e.className).slice(0, 4));
    await (await p.$('#topbar')).screenshot({ path: `shots/top-${w}.png` });
    console.log(w, r);
    await p.close();
  }
  await b.close();
})();
