const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.stack));
  await p.goto('http://localhost:3000/#/c/ielts/reading');
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => [...document.querySelectorAll('#app button, #app a.btn')].map(b=>b.className).join(' | ')), errs);
  await b.close();
})();
