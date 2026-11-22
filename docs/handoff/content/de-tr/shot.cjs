const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad/de-tr/';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('prepplay:tourDone', 'true');
    localStorage.setItem('prepplay:welcomeDone', 'true');
    localStorage.setItem('prepplay:lang', '"ru"');
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const routes = [['c/german', 'german'], ['c/german/a1', 'german-a1'], ['c/goethe', 'goethe'], ['c/testdaf', 'testdaf'], ['c/turkish', 'turkish'], ['c/tomer', 'tomer'], ['cards/de', 'cards-de'], ['cards/tr', 'cards-tr']];
  for (const [r, name] of routes) {
    await page.goto(`http://localhost:3151/#/${r}`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${name}.png`, fullPage: false });
    const txt = (await page.innerText('body')).slice(0, 300).replace(/\s+/g, ' ');
    console.log(name, '|', txt);
  }
  // Пробуем начать тренировку немецкого A1 и турецкого B1.
  for (const [r, name] of [['c/german/a1', 'play-de'], ['c/turkish/b1', 'play-tr']]) {
    await page.goto(`http://localhost:3151/#/${r}`);
    await page.waitForTimeout(1200);
    const btn = page.locator('a.btn, button.btn').filter({ hasText: /Тренировк|Начать|Играть|Старт/ }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `${OUT}${name}.png` });
    console.log(name, '|', (await page.innerText('body')).slice(0, 300).replace(/\s+/g, ' '));
  }
  console.log('errors:', errors);
  await browser.close();
})();
