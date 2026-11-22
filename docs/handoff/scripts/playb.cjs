const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const port of [3101, 3102]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    const res = [];
    for (const r of ['/c/ent', '/quiz', '/daily', '/blitz']) {
      await p.goto(`http://localhost:${port}/#${r}`);
      await p.waitForTimeout(800);
      if (r === '/c/ent') {
        const a = await p.$('a[href^="#/c/ent/"]');
        await a.click();
        await p.waitForTimeout(900);
      }
      if (r === '/quiz') { const btn = await p.$('.quiz-hero .btn-primary, .btn-primary'); if (btn) await btn.click(); await p.waitForTimeout(900); }
      let answered = 0;
      for (let k = 0; k < 3; k++) {
        const ch = await p.$('.choice:not([disabled]), .opt:not([disabled]), .q-area button.choice');
        if (!ch) break;
        await ch.click();
        answered++;
        await p.waitForTimeout(500);
        const nx = await p.$('.next-btn, .btn-next, button.btn-primary:has-text("Дальше")');
        if (nx) { await nx.click(); await p.waitForTimeout(400); }
      }
      res.push(`${r}: сессия ${!!(await p.$('.session, .q-area'))}, ответов ${answered}`);
    }
    console.log(port, res.join(' | '), errs);
    await p.close();
  }
  await b.close();
})();
