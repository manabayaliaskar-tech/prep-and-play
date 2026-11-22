const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  const ids = ['linear', 'ohm', 'punnett', 'sorting', 'parabola', 'pendulum', 'binary', 'timezones'];
  for (const id of ids) {
    await p.goto(`http://localhost:3101/#/explain/${id}`);
    await p.waitForTimeout(700);
    await p.evaluate(() => { const s = document.querySelector('.ex-slider input'); if (s) { s.value = String((+s.min + +s.max) / 2 + 0.37); s.dispatchEvent(new Event('input', { bubbles: true })); } });
    await p.waitForTimeout(300);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) errs.push(`${id} overflow ${w}`);
  }
  await p.screenshot({ path: `${__dirname}/ex-check.png` });
  await p.goto('http://localhost:3101/#/explain');
  await p.waitForTimeout(700);
  console.log('cards', await p.$$eval('a[href^="#/explain/"]', (x) => x.length), 'errors', errs);
  await b.close();
})();
