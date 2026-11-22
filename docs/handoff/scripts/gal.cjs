// node gal.cjs <slot> [width] — скриншот галереи
const { chromium } = require('playwright');
(async () => {
  const slot = process.argv[2] || 'moods';
  const w = Number(process.argv[3] || 1100);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://localhost:3101/tools/gallery.html?slot=${slot}${process.argv[4] ? "&" + process.argv[4] : ""}`);
  await p.waitForTimeout(900);
  await p.addStyleTag({ content: '*{animation-play-state:paused!important}' });
  await p.screenshot({ path: `${__dirname}/gal-${slot}.png`, fullPage: true });
  console.log(slot, 'errors', errs);
  await b.close();
})();
