const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  const SP = process.argv[2];
  const check = async (name) => { const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth })); console.log(name, r.sw > r.w ? 'OVERFLOW ' + r.sw : 'ok'); };
  for (const r of ['/', '/map', '/profile', '/exam', '/duel', '/detective']) { await p.goto('http://localhost:8765/#' + r); await p.waitForTimeout(400); await check(r); }
  await p.goto('http://localhost:8765/#/'); await p.waitForTimeout(500);
  await p.screenshot({ path: SP + '/m-home.png' });
  await p.goto('http://localhost:8765/#/level/rw1/1'); await p.waitForTimeout(500); await check('level');
  await p.screenshot({ path: SP + '/m-q.png' });
  await p.click('.choice >> nth=0'); await p.click('.btn-check'); await p.waitForTimeout(500);
  await p.screenshot({ path: SP + '/m-fb.png' });
  await p.goto('http://localhost:8765/#/exam'); await p.waitForTimeout(300); await p.click('[data-section="math"]'); await p.click('.start-btn'); await p.waitForTimeout(400); await check('exam-module');
  await p.screenshot({ path: SP + '/m-exam.png' });
  console.log('errors', errs);
  await b.close();
})();
