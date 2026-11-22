const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', (e) => console.log('ERR', String(e.stack || e).slice(0, 300)));
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/');
  await p.evaluate(() => { localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 20000, shards: 500 })); });
  await p.goto('http://localhost:3101/#/shop/wear');
  await p.reload();
  await p.waitForTimeout(800);
  await p.goto('http://localhost:3101/#/shop/emote');
  await p.waitForTimeout(600);
  console.log(await p.$$eval('.gcard', (x) => x.slice(0, 5).map((e) => e.dataset.try)));
  await p.click('.gcard >> nth=0');
  await p.waitForTimeout(400);
  console.log(await p.$eval('.s3-try', (e) => e.innerText.slice(0, 300)));
  await b.close();
})();
