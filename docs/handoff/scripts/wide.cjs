const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:3000/#/shop');
  await p.waitForTimeout(800);
  for (const route of ['/shop', '/']) {
    await p.goto('http://localhost:3000/#' + route);
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e=>!e.closest('svg')).filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map((e) => e.tagName+'.'+e.className + ' ' + Math.round(e.getBoundingClientRect().right)));
    console.log(route, r, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  await b.close();
})();
