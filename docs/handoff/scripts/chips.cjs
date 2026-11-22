const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/');
  await p.waitForTimeout(1200);
  const first = await p.$('.daily-course');
  await first.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await p.screenshot({ path: __dirname + '/chips.png' });
  console.log('scroll', await p.evaluate(() => document.documentElement.scrollWidth));
  await b.close();
})();
