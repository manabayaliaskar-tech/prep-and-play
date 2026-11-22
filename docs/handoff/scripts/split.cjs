const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const port of [3102, 3101]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = []; let bytes = 0; const files = new Set();
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    p.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 160)));
    p.on('response', async (r) => { if (r.url().includes('/src/')) files.add(r.url().split('/').pop().split('?')[0]); });
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:lessonsSeen', JSON.stringify({ 'm.lineq': 1 })); });
    await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(2500);
    const homeFiles = files.size;
    const res = [];
    for (const r of ['practice', 'exams', 'c/ent', 'x/ent/path', 'shop', 'profile', 'season', 'explain', 'explain/balance', 'sat', 'map', 'quiz', 'c/ege/base', 'today', 'plan']) {
      await p.goto(`http://localhost:${port}/#/${r}`); await p.waitForTimeout(900);
      const ok = await p.evaluate(() => document.querySelector('#app').innerText.trim().length > 20);
      res.push(r + (ok ? '' : ':EMPTY'));
    }
    await p.goto(`http://localhost:${port}/#/c/ege/base`); await p.waitForTimeout(800); await p.click('.start-train'); await p.waitForTimeout(1200);
    res.push('session:' + !!(await p.$('.btn-check, .lesson-page')));
    console.log(port, 'home files', homeFiles, res.join(' '), errs.slice(0, 5));
    await p.close();
  }
  await b.close();
})();
