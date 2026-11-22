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
  for (const lang of ['de', 'tr']) {
    await page.goto(`http://localhost:3151/#/cards/${lang}`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}cards-${lang}.png` });
    await page.locator('.start-btn').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}cards-${lang}-play.png` });
    console.log(lang, (await page.innerText('body')).slice(0, 200).replace(/\s+/g, ' '));
  }
  // Тренировка: список ссылок на уровне курса.
  for (const [r, name] of [['c/german/b1', 'play-de'], ['c/turkish/a2', 'play-tr']]) {
    await page.goto(`http://localhost:3151/#/${r}`);
    await page.waitForTimeout(1200);
    const links = await page.$$eval('a', (as) => as.map((a) => a.getAttribute('href')).filter((h) => h && /play|practice|test|train/.test(h)));
    console.log(name, links.slice(0, 6));
    if (links[0]) {
      await page.goto(`http://localhost:3151/${links[0]}`);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}${name}.png` });
      console.log(name, (await page.innerText('body')).slice(0, 300).replace(/\s+/g, ' '));
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3151/#/c/goethe');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}goethe-desk.png` });
  console.log('errors:', errors);
  await browser.close();
})();
