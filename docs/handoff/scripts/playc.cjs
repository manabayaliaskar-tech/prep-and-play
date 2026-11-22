const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const port of [3101, 3102]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    const res = [];
    for (const r of ['/daily', '/blitz', '/c/ent/math', '/survival']) {
      await p.goto(`http://localhost:${port}/#${r}`);
      await p.waitForTimeout(1000);
      const st = await p.$('.btn-primary');
      if (!(await p.$('.choice')) && st) { await st.click(); await p.waitForTimeout(900); }
      let answered = 0;
      for (let k = 0; k < 3; k++) {
        const ch = await p.$('.choice:not([disabled])');
        if (!ch) break;
        await ch.click();
        answered++;
        await p.waitForTimeout(1500);
      }
      res.push(`${r}: ${answered}`);
    }
    console.log(port, 'ответов:', res.join(' | '), errs);
    await p.close();
  }
  await b.close();
})();
