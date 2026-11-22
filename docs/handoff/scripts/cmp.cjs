const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1060, height: 330 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3101/tools/_cmp.html');
  await p.waitForTimeout(800);
  await p.addStyleTag({ content: '*{animation-play-state:paused!important}' });
  await p.screenshot({ path: __dirname + '/prepi-compare.png' });
  await b.close();
})();
