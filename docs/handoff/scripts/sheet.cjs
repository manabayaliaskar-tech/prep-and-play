const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3101/#/sheets'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${__dirname}/sheets-${w}.png` });
    const n = await p.$$eval('.sheet-card', (l) => l.length);
    await p.goto('http://localhost:3101/#/sheet/ent/math'); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${__dirname}/sheet-${w}.png` });
    if (w === 1280) {
      await p.goto('http://localhost:3101/#/sheet/sat'); await p.waitForTimeout(1200);
      const satTopics = await p.$$eval('.sheet-topic', (l) => l.length);
      await p.goto('http://localhost:3101/#/sheet/ent/math'); await p.waitForTimeout(1000);
      await p.emulateMedia({ media: 'print' });
      await p.screenshot({ path: `${__dirname}/sheet-print.png` });
      await p.pdf({ path: `${__dirname}/sheet.pdf`, format: 'A4' });
      console.log('sat topics', satTopics);
    }
    console.log(w, 'cards', n, await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
