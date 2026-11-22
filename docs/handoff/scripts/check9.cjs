const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
  await p.goto('http://localhost:3000/');
  await p.evaluate(() => localStorage.setItem('prepplay:lang', JSON.stringify('ru')));
  await p.reload();
  const hero = await p.$('.quiz-hero');
  await hero.scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -80));
  await p.waitForSelector('.host-go', { timeout: 9000 });
  const box = await hero.boundingBox();
  await p.screenshot({ path: S + 'r-bubble.png', clip: { x: 0, y: Math.max(0, box.y - 70), width: 390, height: 420 } });
  const href = await p.getAttribute('.host-go', 'href');
  const label = await p.textContent('.host-go span');
  await p.click('.host-go');
  await p.waitForSelector('.q-card', { timeout: 5000 });
  await p.waitForTimeout(400);
  const title = await p.textContent('.session-title span');
  const tags = [];
  for (let i = 0; i < 10; i++) {
    tags.push((await p.textContent('.q-tag')).trim());
    const choice = await p.$('.choice:not([disabled])');
    if (choice) await choice.click();
    else await p.fill('.spr-input', '1');
    await p.click('.btn-check');
    await p.waitForTimeout(200);
    const next = await p.$('.btn-check:not([disabled])');
    if (next) await next.click();
    await p.waitForTimeout(250);
  }
  await p.screenshot({ path: S + 'r-result.png' });
  console.log({ href, label, title, tags: [...new Set(tags)], hash: await p.evaluate(() => location.hash), customPoolsSaved: await p.evaluate(() => localStorage.getItem('prepplay:quizPools')), errs });
  await b.close();
})();
