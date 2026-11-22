const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const db = { progress: null, reports: [], calls: [] };
  await ctx.route('https://wkwqbghmghhsvjajlkoi.supabase.co/**', async (route) => {
    const req = route.request(); const url = new URL(req.url()); const body = req.postData() ? JSON.parse(req.postData()) : null;
    db.calls.push(req.method() + ' ' + url.pathname + (req.headers()['authorization'] ? ' +auth' : '') + ' key=' + (req.headers()['apikey'] || '').slice(0, 15));
    const json = (s, d) => route.fulfill({ status: s, contentType: 'application/json', body: d === undefined ? '' : JSON.stringify(d) });
    if (url.pathname === '/auth/v1/otp') return json(200, {});
    if (url.pathname === '/auth/v1/verify') return body.token === '123456' ? json(200, { access_token: 'a.eyJzdWIiOiJ1MSJ9.c', refresh_token: 'r1', expires_in: 3600, user: { id: 'u1', email: body.email } }) : json(403, { error_code: 'otp_expired', msg: 'Token has expired or is invalid' });
    if (url.pathname === '/rest/v1/progress' && req.method() === 'GET') return json(200, db.progress ? [db.progress] : []);
    if (url.pathname === '/rest/v1/progress' && req.method() === 'POST') { db.progress = { data: body.data, updated_at: body.updated_at }; return json(201); }
    if (url.pathname === '/rest/v1/reports') { db.reports.push(body); return json(201); }
    return json(404, {});
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 250, coins: 40 })); });
  await p.goto('http://localhost:3101/#/profile'); await p.waitForTimeout(1500);
  await p.screenshot({ path: __dirname + '/acc-1.png', clip: { x: 0, y: 0, width: 1280, height: 600 } });
  await p.fill('.acc-input', 'student@example.com'); await p.click('.acc-email-form button'); await p.waitForTimeout(600);
  await p.fill('.acc-code', '111111'); await p.click('.acc-code-form button'); await p.waitForTimeout(600);
  const err = await p.textContent('.acc-error');
  await p.fill('.acc-code', '123456'); await p.click('.acc-code-form button'); await p.waitForTimeout(1200);
  await p.screenshot({ path: __dirname + '/acc-2.png', clip: { x: 0, y: 0, width: 1280, height: 600 } });
  const signed = !!(await p.$('.account-card.is-in'));
  const pushedXp = db.progress ? JSON.parse(db.progress.data.profile).xp : null;
  // отчёт об ошибке
  await p.goto('http://localhost:3101/#/survival'); await p.waitForTimeout(800); await p.click('.start-btn'); await p.waitForTimeout(900);
  await p.click('.report-btn'); await p.waitForTimeout(300);
  await p.click('.rep-form input[value="text"]'); await p.fill('.rep-text', 'опечатка в варианте B');
  await p.screenshot({ path: __dirname + '/acc-rep.png' });
  await p.click('.modal [data-action="1"]'); await p.waitForTimeout(800);
  // второе устройство: облако новее, пусто локально → берём из облака
  const p2 = await (await b.newContext()).newPage();
  console.log({ err, signed, pushedXp, reports: db.reports, errs, calls: db.calls.slice(0, 8) });
  await b.close();
})();
