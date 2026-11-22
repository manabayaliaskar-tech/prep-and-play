const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(1000);
  for (const [r, sel] of [['/c/ege/base', '.start-train'], ['/x/ent/blitz', '.start-btn'], ['/blitz', '.start-btn'], ['/adapt/ent', null], ['/mock/oge', null], ['/detective', '.start-btn']]) {
    await p.evaluate((h) => (location.hash = h), '#' + r); await p.waitForTimeout(900);
    if (sel) { await p.click(sel).catch((e) => errs.push('click ' + sel)); await p.waitForTimeout(800); }
    const info = await p.evaluate(() => ({ hash: location.hash, btns: [...document.querySelectorAll('#app button, #app a.btn')].slice(0, 8).map((b) => (b.className.split(' ').find((c) => !/^btn/.test(c)) || b.className) + ':' + b.innerText.trim().slice(0, 18)), choices: document.querySelectorAll('[data-choice]').length, check: !!document.querySelector('.btn-check') }));
    console.log(r, JSON.stringify(info));
    await p.screenshot({ path: `${__dirname}/dbg-${r.replace(/\//g, '_')}.png` });
  }
  console.log(errs);
  await b.close();
})();
