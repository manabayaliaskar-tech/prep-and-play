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
  for (const [r, name] of [['c/german/b1', 'play-de'], ['c/turkish/a2', 'play-tr'], ['c/tomer/c1', 'play-tomer']]) {
    await page.goto(`http://localhost:3151/#/${r}`);
    await page.waitForTimeout(1200);
    await page.locator('.start-train').first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${name}.png` });
    console.log(name, (await page.innerText('body')).slice(0, 400).replace(/\s+/g, ' '));
    // Ответить на первый вопрос, чтобы увидеть разбор.
    const choice = page.locator('.choice, .mc-choice, button[data-i], .opt').first();
    if (await choice.count()) {
      await choice.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}${name}-ex.png` });
    }
  }
  // Уроки-теория по теме.
  await page.goto('http://localhost:3151/#/c/turkish/a1');
  await page.waitForTimeout(1000);
  await page.getByText('Теория').first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}lesson-tr.png` });
  console.log('lesson', (await page.innerText('body')).slice(0, 300).replace(/\s+/g, ' '));
  console.log('errors:', errors);
  await browser.close();
})();
