const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:3000/#/');
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => document.querySelector('#app')?.innerHTML.slice(0, 200)), errs);
  await b.close();
})();
