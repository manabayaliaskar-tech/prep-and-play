const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const port of [3101, 3102]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
    await p.goto(`http://localhost:${port}/`);
    await p.evaluate(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto(`http://localhost:${port}/#/`);
    await p.waitForTimeout(700);
    res[port] = await p.evaluate(() => [...document.querySelectorAll('img.emo')].map((i) => { const e = i.parentElement; return `${e.tagName}.${e.className}<${e.parentElement?.className}>:${i.alt}`; }));
    res['h' + port] = await p.evaluate(() => document.body.innerText.split('\n'));
    await p.close();
  }
  const count = (arr) => arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
  const a = count(res[3101]); const c = count(res[3102]);
  for (const k of new Set([...Object.keys(a), ...Object.keys(c)])) if (a[k] !== c[k]) console.log('emo', k, a[k], c[k]);
  const ta = res.h3101; const tc = res.h3102;
  for (let i = 0; i < Math.max(ta.length, tc.length); i++) if (ta[i] !== tc[i]) console.log('text', i, JSON.stringify(ta[i]), '|', JSON.stringify(tc[i]));
  await b.close();
})();
