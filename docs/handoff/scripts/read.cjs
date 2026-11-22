const { chromium } = require('playwright');
const SH = '/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad/shots/';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000/#/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); });
  await p.reload();
  let found = '';
  for (let i = 0; i < 8 && !found; i++) {
    await p.goto('http://localhost:3000/#/c/ielts/reading');
    await p.waitForTimeout(500);
    await p.click('.option-card');
    await p.waitForTimeout(500);
    const paras = await p.$$eval('.passage p', (x) => x.length);
    const label = await p.$eval('.passage-label', (e) => e.textContent).catch(() => '');
    if (paras > 1) { found = label; await p.screenshot({ path: SH + 'reading-long.png', fullPage: true }); }
  }
  console.log('long passage:', found, errs);
  await b.close();
})();
