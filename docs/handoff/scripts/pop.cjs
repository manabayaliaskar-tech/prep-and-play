const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[1280, 700], [390, 800]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', (e) => console.log('PAGEERROR ' + e.message));
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle' });
    await page.click('.theme-btn');
    await page.waitForTimeout(400);
    await page.click('[data-theme-id="mint"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `shots/pop-${w}.png` });
    const t = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('prepplay:theme'), document.querySelector('meta[name=theme-color]').content]);
    console.log(w, t);
    await page.close();
  }
  await browser.close();
})();
