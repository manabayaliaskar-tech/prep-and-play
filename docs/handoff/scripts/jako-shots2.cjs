const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad/ja-ko';
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
  for (const r of ['#/c/japanese', '#/c/korean', '#/c/jlpt']) {
    await page.goto(`http://localhost:3141/${r}`);
    await page.waitForTimeout(1200);
    const el = await page.$('.track-grid, .path, .level-path, .xp-islands, .track-list');
    if (el) await el.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/${r.replace(/[#/]+/g, '_').replace(/^_/, '')}_levels.png`, fullPage: true });
  }
  async function session(route, name, answers = 3) {
    await page.goto(`http://localhost:3141/${route}`);
    await page.waitForTimeout(1200);
    await page.getByText('Тренировка', { exact: false }).first().click();
    await page.waitForTimeout(1200);
    const skip = page.getByText('Я уже знаю', { exact: false }).first();
    if (await skip.count()) { await skip.click(); await page.waitForTimeout(1200); }
    for (let i = 0; i < answers; i++) {
      await page.screenshot({ path: `${OUT}/${name}_q${i + 1}.png` });
      const opts = await page.$$('[data-choice]');
      if (!opts.length) { console.log('no options', name); break; }
      await opts[0].click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}/${name}_a${i + 1}.png` });
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(name, i, 'overflow', ov);
      const next = page.getByRole('button', { name: /Дальше|Далее|Продолжить/ }).first();
      if (await next.count()) await next.click().catch(() => {});
      await page.waitForTimeout(700);
    }
  }
  await session('#/c/japanese/n5', 'ja_n5');
  await session('#/c/japanese/n1', 'ja_n1', 2);
  await session('#/c/korean/topik2', 'ko_t2');
  await session('#/c/japanese/kana', 'ja_kana', 2);
  await page.goto('http://localhost:3141/#/cards/ja');
  await page.waitForTimeout(1000);
  await page.click('[data-level="1"]').catch(() => {});
  await page.click('.start-btn').catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/cards_ja_front.png` });
  await page.click('.flashcard').catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/cards_ja_back.png` });
  console.log('errors', errors.slice(0, 10));
  await browser.close();
})();
