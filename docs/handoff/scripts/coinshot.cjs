const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 760, height: 560 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/coinview.html');
  await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/coin.png' });
  await b.close();
})();
