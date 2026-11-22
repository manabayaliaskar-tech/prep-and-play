const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/#/season'); await p.waitForTimeout(1500);
  const shown = !!(await p.$('.pass-intro'));
  await p.goto('http://localhost:3101/#/practice'); await p.waitForTimeout(800);
  console.log('intro shown', shown, 'after nav', !!(await p.$('.pass-intro')));
  await b.close();
})();
