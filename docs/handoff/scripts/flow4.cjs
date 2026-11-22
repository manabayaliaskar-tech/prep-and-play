const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1280, height: 860, n: 'd' }, { width: 400, height: 860, n: 'm' }]) {
    const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e)));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/ielts-full');
    await p.waitForTimeout(400);
    await p.click('.full-start');
    await p.waitForTimeout(300);
    if (vp.n === 'm') await p.click('[data-view="qs"]');
    const pills = await p.$$('.full-pill');
    await pills[0].click();
    await pills[4].click();
    await p.selectOption('.full-select >> nth=0', '0');
    await p.screenshot({ path: S + `full-${vp.n}.png` });
    if (vp.n === 'm') {
      await p.click('[data-view="qs"]');
      await p.waitForTimeout(200);
      await p.screenshot({ path: S + 'full-m-qs.png' });
    }
    await p.click('.full-finish >> nth=0');
    await p.waitForTimeout(600);
    await p.screenshot({ path: S + `full-res-${vp.n}.png` });
    await p.goto('http://localhost:3000/#/c/ielts/listening');
    await p.waitForTimeout(400);
    await p.click('.start-train');
    await p.waitForTimeout(500);
    await p.screenshot({ path: S + `listen-${vp.n}.png` });
    console.log(vp.n, 'width', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
