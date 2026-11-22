const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/c/ege/base'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${__dirname}/lesson-setup-${w}.png` });
    await p.click('.start-train'); await p.waitForTimeout(700);
    await p.click('.lesson-opt[data-i="1"]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `${__dirname}/lesson-${w}.png`, fullPage: true });
    await p.click('.lesson-next'); await p.waitForTimeout(800);
    const inSession = await p.$('.btn-check');
    await p.goto('http://localhost:3101/#/'); await p.goto('http://localhost:3101/#/c/ege/base'); await p.waitForTimeout(800);
    await p.click('.start-train'); await p.waitForTimeout(700);
    console.log(w, 'session:', !!inSession, 'second time lesson:', !!(await p.$('.lesson-page')), await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
