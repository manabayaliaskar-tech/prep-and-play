const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:3000/#/season');
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => [document.documentElement.scrollWidth, ...[...document.querySelectorAll('body *')].filter((e) => !e.closest('svg') && !e.closest('.season-track-wrap') && e.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map((e) => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right))]));
  await b.close();
})();
