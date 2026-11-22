const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  const bad = []; p.on('response', (r) => r.status() >= 400 && bad.push(r.status() + ' ' + r.url()));
  await p.goto('http://localhost:3102/exams/ent/'); await p.waitForTimeout(800);
  await p.screenshot({ path: __dirname + '/seo-exam.png' });
  const t1 = await p.title();
  await p.click('.grid a >> nth=0'); await p.waitForTimeout(800);
  await p.screenshot({ path: __dirname + '/seo-lesson.png', fullPage: true });
  const t2 = await p.title();
  await p.click('.cta .btn'); await p.waitForTimeout(2500);
  const inApp = await p.evaluate(() => location.hash + ' ' + (document.querySelector('#app')?.innerText.length > 50));
  console.log({ t1, t2, inApp, bad: bad.slice(0, 5), errs });
  await b.close();
})();
