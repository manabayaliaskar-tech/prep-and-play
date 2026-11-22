// node shop3.cjs <tab> <w> — скриншот магазина
const { chromium } = require('playwright');
(async () => {
  const tab = process.argv[2] || 'home';
  const w = Number(process.argv[3] || 1280);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/');
  await p.evaluate(() => { const pr = JSON.parse(localStorage.getItem('prepplay:profile') || '{}'); pr.coins = 5000; pr.shards = 300; localStorage.setItem('prepplay:profile', JSON.stringify(pr)); });
  await p.goto(`http://localhost:3101/#/shop/${tab}`);
  await p.reload();
  await p.waitForTimeout(1200);
  if (process.argv[4]) { await p.click(process.argv[4]); await p.waitForTimeout(700); }
  await p.screenshot({ path: `${__dirname}/s3-${tab}-${w}.png`, fullPage: true });
  const ovf = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(tab, w, 'scrollWidth', ovf, 'errors', errs);
  await b.close();
})();
