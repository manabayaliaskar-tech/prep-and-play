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
      const d = new Date(); const k = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      const y = new Date(Date.now() - 86400000);
      localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 3000, coins: 2600, streak: { count: 32, last: k(y), best: 32 }, counters: { answered: 300, correct: 260 }, achievements: { first: '2026-11-01' } }));
    });
    await p.reload();
    await p.waitForTimeout(800);
    await p.screenshot({ path: `shots/life-home-${tag}.png` });
    await p.goto('http://localhost:3000/#/shop');
    await p.waitForTimeout(800);
    await p.screenshot({ path: `shots/shop-${tag}.png` });
    // примерка и покупка
    await p.click('.deal-grid .shop-item');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/shop-try-${tag}.png` });
    const buy = await p.$('.shop-buy');
    if (buy) await buy.click();
    await p.waitForTimeout(600);
    const coins = await p.$eval('.coin-balance b', (e) => e.textContent);
    // вкладка питомцы
    await p.click('[data-tab="pet"]');
    await p.waitForTimeout(300);
    await p.screenshot({ path: `shots/shop-pets-${tag}.png`, fullPage: true });
    // сундук
    await p.click('[data-box="basic"]');
    await p.waitForTimeout(300);
    await p.click('.lootbox');
    await p.waitForTimeout(1700);
    await p.screenshot({ path: `shots/shop-loot-${tag}.png` });
    const owned = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).owned);
    const o = await p.evaluate(() => [document.documentElement.scrollWidth - document.documentElement.clientWidth, ...[...document.querySelectorAll('body *')].filter((e) => !e.closest('svg') && e.getBoundingClientRect().right > innerWidth + 1).slice(0, 5).map((e) => e.tagName + '.' + e.className)]);
    console.log(tag, { coins, owned, o }, errs);
    await p.close();
  }
  await b.close();
})();
