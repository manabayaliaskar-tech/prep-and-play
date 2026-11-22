const { chromium } = require('playwright');
const S = __dirname + '/';
const routes = ['/', '/practice', '/exams', '/c/ent', '/c/ielts', '/c/math', '/diag/ent', '/know/ent', '/adapt/math', '/saved', '/plan', '/ielts-full', '/explain', '/explain/parabola', '/explain/balance', '/today', '/profile', '/shop', '/season', '/mock/ielts', '/c/ielts/listening'];
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 375, h: 812, n: 'm' }, { w: 1280, h: 860, n: 'd' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
    await p.goto('http://localhost:3000/');
    await p.evaluate(() => {
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      localStorage.setItem('prepplay:plan', JSON.stringify({ course: 'ent', date: '2027-02-20', created: '2026-11-17', tracks: ['mathlit', 'history', 'reading', 'math', 'physics'] }));
    });
    for (const r of routes) {
      await p.goto('http://localhost:3000/#' + r);
      await p.waitForTimeout(500);
      const w = await p.evaluate(() => document.documentElement.scrollWidth);
      if (w > vp.w) {
        const culprit = await p.evaluate((vw) => [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > vw + 1).slice(0, 4).map((el) => el.className || el.tagName).join(' | '), vp.w);
        console.log(vp.n, r, 'OVERFLOW', w, culprit);
      }
    }
    for (const r of ['/', '/know/ent', '/plan', '/explain', '/c/ent', '/saved']) {
      await p.goto('http://localhost:3000/#' + r);
      await p.waitForTimeout(900);
      await p.screenshot({ path: S + `g-${vp.n}${r.replace(/\//g, '_')}.png`, fullPage: vp.n === 'm' });
    }
    console.log(vp.n, 'errors', errs);
    await p.close();
  }
  await b.close();
})();
