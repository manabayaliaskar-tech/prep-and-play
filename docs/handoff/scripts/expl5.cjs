const { chromium } = require('playwright');
const IDS = ['timeline-kz', 'timeline-world', 'tenses'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(() => {
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    localStorage.setItem('prepplay:tourDone', 'true');
  });
  await p.goto('http://localhost:3101/#/explain');
  await p.waitForTimeout(1200);
  for (const id of IDS) {
    const before = errs.length;
    await p.evaluate((h) => (location.hash = h), '#/explain/' + id);
    await p.waitForTimeout(700);
    for (const bt of await p.$$('[data-b]')) {
      await bt.click().catch(() => {});
      await p.waitForTimeout(150);
    }
    for (const sl of await p.$$('input[type=range]')) {
      await sl.evaluate((el) => {
        el.value = el.max;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await p.waitForTimeout(80);
      await sl.evaluate((el) => {
        el.value = el.min;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    await p.waitForTimeout(500);
    const nan = await p.evaluate(() => /NaN|undefined/.test(document.querySelector('#app').innerText + (document.querySelector('#app svg')?.outerHTML ?? '')));
    console.log(id, errs.length > before ? 'ОШИБКА ' + errs.slice(before).join(' | ') : 'ok', nan ? 'NaN/undefined!' : '');
    if (['timeline-kz', 'tenses'].includes(id)) await p.screenshot({ path: `${__dirname}/ex-${id}.png` });
  }
  await b.close();
})();
