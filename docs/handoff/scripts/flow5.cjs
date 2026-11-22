const { chromium } = require('playwright');
const S = __dirname + '/';
const ids = ['balance', 'fractions', 'percent', 'pythagoras', 'angles', 'parabola', 'unit-circle', 'derivative', 'probability', 'motion'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack || e)));
  await p.goto('http://localhost:3000/#/explain');
  await p.waitForTimeout(400);
  await p.screenshot({ path: S + 'ex-index.png', fullPage: true });
  for (const id of ids) {
    await p.goto('http://localhost:3000/#/explain/' + id);
    await p.waitForTimeout(300);
    const btns = await p.$$('[data-b]');
    for (const bt of btns.slice(0, 2)) {
      await bt.click();
      await p.waitForTimeout(id === 'unit-circle' || id === 'derivative' || id === 'motion' ? 2800 : 300);
    }
    const sl = await p.$('[data-k]');
    if (sl) await sl.evaluate((el) => { el.value = el.max; el.dispatchEvent(new Event('input')); });
    await p.waitForTimeout(150);
    await p.screenshot({ path: S + `ex-${id}.png` });
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(id, w, (await p.textContent('.ex-caption')).slice(0, 80));
  }
  console.log('ERR', errs);
  await b.close();
})();
