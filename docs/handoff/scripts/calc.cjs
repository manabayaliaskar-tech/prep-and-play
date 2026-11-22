const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:lastSection', JSON.stringify('math')); });
    await p.goto('http://localhost:3101/#/survival'); await p.waitForTimeout(1000);
    await p.click('.start-btn'); await p.waitForTimeout(1000);
    await p.click('.ref-btn'); await p.waitForTimeout(500);
    await p.screenshot({ path: `${__dirname}/calc-confirm-${w}.png` });
    await p.click('.modal [data-action="1"]'); await p.waitForTimeout(500);
    await p.click('.calc-key[data-k="2nd"]'); await p.click('.calc-key[data-k="2nd"]');
    for (const k of ['sin', '3', '0', ')', '+', '√', '1', '6', ')', '×', '2']) await p.click(`.calc-key[data-k="${k}"]`);
    await p.waitForTimeout(200);
    const prev = await p.textContent('.calc-preview');
    await p.click('.calc-key[data-k="="]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `${__dirname}/calc-${w}.png` });
    console.log(w, 'preview', prev, 'value', await p.inputValue('.calc-expr'), 'helped', await p.evaluate(() => document.querySelector('.session').classList.contains('is-helped')), errs);
    await p.close();
  }
  await b.close();
})();
