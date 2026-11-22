const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: __dirname + '/live-hub.png', clip: { x: 0, y: 60, width: 390, height: 330 } });
  await p.goto('http://localhost:3101/#/profile');
  await p.waitForTimeout(1200);
  await p.screenshot({ path: __dirname + '/live-profile.png', clip: { x: 0, y: 60, width: 390, height: 600 } });
  await b.close();
})();
