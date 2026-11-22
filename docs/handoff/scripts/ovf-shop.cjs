const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  for (const tab of ['home', 'wear', 'sets', 'chests', 'room', 'emote']) {
    await p.goto(`http://localhost:3101/#/shop/${tab}`);
    await p.waitForTimeout(900);
    const wide = await p.evaluate(() => [...document.querySelectorAll('.shop3 *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.slot-row, .s3-tabs')).slice(0, 5).map((e) => `${e.tagName}.${String(e.className.baseVal ?? e.className).slice(0, 40)} ${Math.round(e.getBoundingClientRect().right)}`));
    console.log(tab, await p.evaluate(() => document.documentElement.scrollWidth), wide);
  }
  await b.close();
})();
