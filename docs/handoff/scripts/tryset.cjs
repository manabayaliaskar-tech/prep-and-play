const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/');
    await p.evaluate(() => localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 5000 })));
    await p.goto('http://localhost:3101/#/shop/sets');
    await p.reload();
    await p.waitForTimeout(800);
    await p.click('.set3:nth-child(5) .set3-prepi');
    await p.waitForTimeout(900);
    const st = await p.$('.s3-stage');
    await st.screenshot({ path: `${__dirname}/tryset-${w}.png` });
    console.log(w, await p.$eval('.s3-try', (e) => e.innerText.replace(/\s+/g, ' ')), errs);
    await p.close();
  }
  await b.close();
})();
