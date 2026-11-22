// Обход всех страниц: ошибки JS, пустой экран, горизонтальная прокрутка, элементы шире экрана.
const { chromium } = require('playwright');
const routes = JSON.parse(require('fs').readFileSync(__dirname + '/routes.json'));
const W = Number(process.argv[2] || 390);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: 844 } });
  await ctx.route('https://wkwqbghmghhsvjajlkoi.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await ctx.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify(window.__lang || 'ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:passIntroSeen', 'true'); localStorage.setItem('prepplay:welcomeDone', 'true'); });
  const p = await ctx.newPage();
  let errs = [];
  p.on('pageerror', (e) => errs.push('JS: ' + String(e).slice(0, 160)));
  p.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && errs.push('console: ' + m.text().slice(0, 160)));
  const issues = [];
  await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(1500);
  for (const r of routes) {
    errs = [];
    await p.evaluate((h) => (location.hash = h), '#' + r);
    await p.waitForTimeout(r.startsWith('/explain/') ? 500 : 350);
    const info = await p.evaluate((W) => {
      const app = document.querySelector('#app');
      const wide = [...document.querySelectorAll('#app *')].filter((el) => { const rc = el.getBoundingClientRect(); return rc.width > 0 && rc.right > W + 2 && getComputedStyle(el).position !== 'fixed' && !el.closest('[class*="scroll"], .explain-chips, .ts-rings, .xp-nodes, .chip-row, .qh-chips, .tabs, .shop-tabs, pre, code, .table-wrap, .x-scroll, .h-scroll, .cards-row'); }).slice(0, 3).map((el) => el.className.toString().slice(0, 40) || el.tagName);
      return { text: app.innerText.trim().length, sw: document.documentElement.scrollWidth, wide, modal: !!document.querySelector('#modal-root .modal, .pass-intro') };
    }, W);
    const prob = [];
    if (errs.length) prob.push(...errs);
    if (info.text < 20 && !info.modal) prob.push('пусто');
    if (info.sw > W + 1) prob.push(`scroll ${info.sw}`);
    if (info.wide.length) prob.push('шире экрана: ' + info.wide.join(', '));
    if (prob.length) issues.push(`${r}: ${prob.join(' | ')}`);
    if (info.modal) await p.keyboard.press('Escape');
  }
  console.log(`[${W}] проверено ${routes.length}, проблем ${issues.length}`);
  console.log(issues.slice(0, 80).join('\n'));
  await b.close();
})();
