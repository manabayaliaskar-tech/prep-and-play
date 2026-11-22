const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto('https://manabayaliaskar-tech.github.io/prep-and-play/');
  await p.waitForSelector('.hero-card', { timeout: 30000 });
  await p.waitForSelector('.tour.is-in', { timeout: 8000 });
  console.log('главная и экскурсия на живом сайте: ok', errs);
  await b.close();
})();
