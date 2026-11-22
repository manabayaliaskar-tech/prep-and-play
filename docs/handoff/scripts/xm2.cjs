const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [820, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/c/ent'); await p.waitForTimeout(1500);
    await p.evaluate(() => window.scrollTo(0, 380)); await p.waitForTimeout(600);
    await p.screenshot({ path: `${__dirname}/xm2-${w}.png` });
    await p.evaluate(() => document.querySelector('.course-tools')?.scrollIntoView()); await p.waitForTimeout(900);
    await p.screenshot({ path: `${__dirname}/xm2-tools-${w}.png` });
    await p.close();
  }
  await b.close();
})();
