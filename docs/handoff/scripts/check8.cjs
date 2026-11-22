const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 1280, h: 900, n: 'd' }, { w: 390, h: 844, n: 'm' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2 });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
    await p.goto('http://localhost:3000/');
    await p.evaluate(() => localStorage.setItem('prepplay:lang', JSON.stringify('ru')));
    await p.reload();
    await p.waitForTimeout(400);
    const hero = await p.$('.quiz-hero');
    await hero.scrollIntoViewIfNeeded();
    await p.evaluate(() => window.scrollBy(0, -80));
    await p.waitForTimeout(1600);
    const box = await hero.boundingBox();
    const clip = { x: 0, y: Math.max(0, box.y - 70), width: vp.w, height: Math.min(box.height + 130, 900) };
    await p.screenshot({ path: S + `q-hero-spin-${vp.n}.png`, clip });
    await p.waitForTimeout(3600);
    await p.screenshot({ path: S + `q-hero-stop-${vp.n}.png`, clip });
    console.log(vp.n, 'bubble:', await p.textContent('.host-bubble'), 'width', await p.evaluate(() => document.documentElement.scrollWidth));
    await p.goto('http://localhost:3000/#/quiz');
    await p.waitForTimeout(5200);
    await p.screenshot({ path: S + `q-page-${vp.n}.png`, clip: { x: 0, y: 0, width: vp.w, height: 640 } });
    console.log(vp.n, 'quiz width', await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
