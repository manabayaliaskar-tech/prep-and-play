const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 900 } });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/');
  await p.waitForTimeout(1200);
  const a = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.addStyleTag({ content: '.saved-link{display:none!important}' });
  await p.waitForTimeout(200);
  const b2 = await p.evaluate(() => document.documentElement.scrollWidth);
  const wide = await p.evaluate(() => [...document.querySelectorAll('.topbar *')].filter((e) => e.getBoundingClientRect().right > innerWidth).slice(0, 4).map((e) => e.className));
  console.log('with', a, 'without', b2, wide);
  await b.close();
})();
