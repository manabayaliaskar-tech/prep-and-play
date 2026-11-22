const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad/ja-ko';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    localStorage['prepplay:tourDone'] = 'true';
    localStorage['prepplay:welcomeDone'] = 'true';
    localStorage['prepplay:lang'] = '"ru"';
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const routes = ['#/c/japanese', '#/c/japanese/n5', '#/c/jlpt', '#/c/korean', '#/c/topik', '#/cards/ja', '#/cards/ko', '#/c/korean/topik1'];
  for (const r of routes) {
    await page.goto(`http://localhost:3141/${r}`);
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = r.replace(/[#/]+/g, '_').replace(/^_/, '');
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(r, 'overflow', overflow, 'title', await page.title());
  }
  // Пробуем начать тренировку N5 и ответить на вопрос
  await page.goto('http://localhost:3141/#/c/japanese/n5');
  await page.waitForTimeout(1200);
  const btn = await page.$('.start-btn, [data-start], .btn-primary');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/ja_n5_session.png` });
    const opt = await page.$('.choice, .option, [data-choice]');
    if (opt) { await opt.click(); await page.waitForTimeout(800); await page.screenshot({ path: `${OUT}/ja_n5_answer.png` }); }
    console.log('session overflow', await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  }
  await page.goto('http://localhost:3141/#/c/korean/topik2');
  await page.waitForTimeout(1200);
  const b2 = await page.$('.start-btn, [data-start], .btn-primary');
  if (b2) { await b2.click(); await page.waitForTimeout(1500); await page.screenshot({ path: `${OUT}/ko_t2_session.png` }); }
  console.log('errors', errors.slice(0, 10));
  await browser.close();
})();
