const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 820, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    const out = [];
    for (const [r, sel] of [['practice', '.practice-course'], ['exams', '.exam-list .practice-course'], ['explain', '.explain-subj'], ['profile', '.exam-fold']]) {
      await p.goto('http://localhost:3101/#/' + r); await p.waitForTimeout(1200);
      const gap = await p.$$eval(sel, (l) => { const v = l.filter((x) => x.offsetParent).slice(0, 3).map((x) => x.getBoundingClientRect()); return v.length > 1 ? Math.round(v[1].top - v[0].bottom) : null; });
      out.push(r + ':' + gap);
      if (r === 'practice') await p.screenshot({ path: `${__dirname}/gaps-${w}.png` });
    }
    console.log(w, out.join(' '), await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
