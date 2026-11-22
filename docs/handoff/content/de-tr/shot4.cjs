const { chromium } = require('playwright');
const OUT = __dirname + '/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { localStorage.setItem('prepplay:tourDone','true'); localStorage.setItem('prepplay:welcomeDone','true'); localStorage.setItem('prepplay:lang','"ru"'); });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
  for (const [r, name] of [['c/german/b2', 'q-de'], ['c/turkish/b1', 'q-tr']]) {
    await p.goto(`http://localhost:3151/#/${r}`); await p.waitForTimeout(1200);
    await p.locator('.start-train').first().click(); await p.waitForTimeout(1000);
    await p.getByText('Я уже знаю').first().click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}${name}.png` });
    const btns = await p.$$eval('button', (xs) => xs.map((x) => x.className).filter((c) => /choice|opt|answer/.test(c)));
    console.log(name, btns.slice(0, 5), (await p.innerText('main, body')).slice(0, 300).replace(/\s+/g, ' '));
    const c = p.locator('button.choice, button[class*="choice"], button[class*="opt"]').first();
    if (await c.count()) { await c.click(); await p.getByText('Проверить').first().click(); await p.waitForTimeout(900); console.log((await p.innerText('body')).slice(0, 700).replace(/\s+/g, ' ')); await p.screenshot({ path: `${OUT}${name}-ex.png` }); }
  }
  console.log('errors', errors); await b.close();
})();
