// Скриншоты: страница 1 класса и задания с рисунками, отрисованные стилями сайта.
const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad/grades/';
const picks = JSON.parse(process.argv[2] || '[]'); // [[topic, d, seed], ...]
const name = process.argv[3] || 'set';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await page.addInitScript(() => {
    localStorage['prepplay:tourDone'] = 'true';
    localStorage['prepplay:welcomeDone'] = 'true';
    localStorage['prepplay:lang'] = '"ru"';
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (name === 'page') {
    await page.goto('http://localhost:3131/#/c/math/g1');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: OUT + 'g1-page.png', fullPage: true });
  } else {
    await page.goto('http://localhost:3131/');
    await page.waitForTimeout(1500);
    await page.evaluate(async (picks) => {
      const { TOPICS } = await import('/src/pools/topics.js');
      const { questionHtml } = await import('/src/ui/question.js');
      const { createRng } = await import('/src/core/random.js');
      document.body.innerHTML = '<main style="padding:16px;display:grid;gap:16px"></main>';
      const main = document.querySelector('main');
      for (const [t, d, seed] of picks) {
        const q = TOPICS[t].make({ rng: createRng(seed), mcOnly: true, used: new Set(), state: {} }, d);
        main.insertAdjacentHTML('beforeend', questionHtml(q));
      }
    }, picks);
    await page.waitForTimeout(500);
    await page.screenshot({ path: OUT + name + '.png', fullPage: true });
  }
  console.log('errors:', errors.slice(0, 5));
  await browser.close();
})();
