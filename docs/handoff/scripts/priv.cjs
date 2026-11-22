const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  let rpc = 0;
  await ctx.route('https://wkwqbghmghhsvjajlkoi.supabase.co/**', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/rest/v1/rpc/delete_me') { rpc++; return route.fulfill({ status: 204, body: '' }); }
    if (u.pathname === '/rest/v1/progress' && route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.fulfill({ status: 201, body: '' });
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:cloudSession', JSON.stringify({ access_token: 'a', refresh_token: 'r', expires_at: 9999999999, user: { id: 'u1', email: 'a@b.c' } })); });
  await p.goto('http://localhost:3101/#/privacy'); await p.waitForTimeout(1200);
  await p.screenshot({ path: __dirname + '/priv.png' });
  const secs = await p.$$eval('.privacy-sec', (l) => l.length);
  await p.goto('http://localhost:3101/#/profile'); await p.waitForTimeout(1000);
  await p.click('.acc-delete'); await p.waitForTimeout(300); await p.click('.modal [data-action="1"]'); await p.waitForTimeout(800);
  console.log({ secs, rpc, signedOut: !(await p.$('.account-card.is-in')), errs });
  await b.close();
})();
