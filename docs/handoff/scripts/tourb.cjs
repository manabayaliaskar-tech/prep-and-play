const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  const bad = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  p.on('response', (r) => { if (r.status() >= 400) bad.push(r.url()); });
  await p.addInitScript(() => localStorage.setItem('prepplay:lang', JSON.stringify('ru')));
  await p.goto('http://localhost:3102/');
  await p.waitForSelector('.tour.is-in', { timeout: 6000 });
  const n = await p.$$eval('.tour-dots i', (x) => x.length);
  for (let i = 0; i < n; i++) { await p.waitForTimeout(250); await p.click('.tour-next'); }
  await p.waitForTimeout(500);
  console.log('шагов', n, 'закрылась', !(await p.$('.tour')), 'флаг', await p.evaluate(() => localStorage.getItem('prepplay:tourDone')));
  // Повтор из профиля и закрытие при уходе со страницы.
  await p.goto('http://localhost:3102/#/profile');
  await p.waitForTimeout(600);
  await p.click('.tour-btn');
  await p.waitForTimeout(1200);
  console.log('повтор из профиля открылся', !!(await p.$('.tour.is-in')));
  await p.evaluate(() => (location.hash = '#/shop'));
  await p.waitForTimeout(600);
  console.log('после перехода в магазин закрыта', !(await p.$('.tour')), 'body.touring', await p.evaluate(() => document.body.classList.contains('touring')));
  const coins = await p.evaluate(() => [...document.querySelectorAll('.coin')].map((c) => getComputedStyle(c).backgroundImage).slice(0, 2));
  console.log('монета', coins.map((c) => c.slice(-30)));
  await p.screenshot({ path: __dirname + '/build-shop.png' });
  console.log('ошибки', errs, 'битые запросы', bad);
  await b.close();
})();
