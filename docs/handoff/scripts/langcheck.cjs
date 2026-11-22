const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3102/kk/exams/ent/');
  await p.click('a.btn:not(.small)');
  await p.waitForTimeout(2500);
  console.log('url', p.url(), 'lang', await p.evaluate(() => document.documentElement.lang), 'stored', await p.evaluate(() => localStorage.getItem('prepplay:lang')));
  await p.screenshot({ path: __dirname + '/langcheck.png' }); console.log('text', (await p.evaluate(() => document.querySelector('#app')?.innerText || document.body.innerText)).slice(0, 160).replace(/\s+/g, ' '));
  console.log('errors', errs);
  await b.close();
})();
