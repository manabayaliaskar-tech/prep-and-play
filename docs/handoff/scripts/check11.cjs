const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1246, height: 700 } });
  await p.goto('http://localhost:3000/');
  await p.evaluate(() => {
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    localStorage.setItem('prepplay:theme', JSON.stringify('lava'));
  });
  await p.goto('http://localhost:3000/#/shop');
  await p.reload();
  await p.waitForTimeout(700);
  await p.click('[data-tab="face"]');
  await p.waitForTimeout(600);
  const grid = await p.$('.shop-tab.is-active');
  await grid.scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -60));
  await p.waitForTimeout(500);
  await p.screenshot({ path: S + 'e-face.png' });
  await b.close();
})();
