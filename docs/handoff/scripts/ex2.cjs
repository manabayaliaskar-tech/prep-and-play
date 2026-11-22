const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.addInitScript(() => {
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    localStorage.setItem('prepplay:tourDone', 'true');
  });
  await p.goto('http://localhost:3101/#/explain/seasons');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${__dirname}/ex2-seasons-june.png` });
  await p.evaluate(() => {
    const el = document.querySelector('input[data-k="d"]');
    el.value = 355;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${__dirname}/ex2-seasons-dec.png` });
  await p.goto('http://localhost:3101/#/explain/foodchain');
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${__dirname}/ex2-food.png` });
  await b.close();
})();
