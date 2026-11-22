const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  // 1) Сервис-воркер и офлайн
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000/');
  await p.waitForTimeout(1500);
  const sw = await p.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  const manifest = await p.evaluate(async () => (await fetch('manifest.webmanifest')).ok);
  await p.reload();
  await p.waitForTimeout(800);
  await ctx.setOffline(true);
  await p.reload();
  await p.waitForTimeout(1200);
  const offlineOk = await p.evaluate(() => Boolean(document.querySelector('.hero-card')));
  await p.goto('http://localhost:3000/#/quiz/classic');
  await p.waitForTimeout(800);
  const offlineQuiz = await p.evaluate(() => Boolean(document.querySelector('.quiz-modes')));
  await ctx.setOffline(false);
  console.log('sw', sw, 'manifest', manifest, 'offline home', offlineOk, 'offline quiz', offlineQuiz, errs);
  await ctx.close();

  // 2) iPad: карточка установки, инструкция; баннер серии
  const ipad = await b.newContext({ ...devices['iPad Pro 11'] });
  const q = await ipad.newPage();
  const errs2 = [];
  q.on('pageerror', (e) => errs2.push(e.message));
  await q.goto('http://localhost:3000/#/');
  await q.evaluate(() => {
    const y = new Date(Date.now() - 86400000);
    const key = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 300, streak: { count: 6, last: key, best: 6 } }));
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    localStorage.removeItem('prepplay:installDismissed');
  });
  await q.reload();
  await q.waitForTimeout(800);
  const risk = Boolean(await q.$('.streak-risk'));
  const card = Boolean(await q.$('.install-card'));
  await q.screenshot({ path: 'shots/pwa-ipad-home.png' });
  if (card) {
    await q.click('.install-go');
    await q.waitForTimeout(400);
    await q.screenshot({ path: 'shots/pwa-ipad-steps.png' });
  }
  console.log('ipad risk', risk, 'installCard', card, errs2);
  await b.close();
})();
