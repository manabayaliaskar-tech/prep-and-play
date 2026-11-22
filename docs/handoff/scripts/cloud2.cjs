const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const remoteXp of [null, 900]) {
    const ctx = await b.newContext();
    const db = { progress: remoteXp ? { data: { profile: JSON.stringify({ xp: remoteXp }) }, updated_at: '2026-11-18T10:00:00Z' } : null };
    await ctx.route('https://wkwqbghmghhsvjajlkoi.supabase.co/**', async (route) => {
      const req = route.request(); const url = new URL(req.url());
      const json = (s, d) => route.fulfill({ status: s, contentType: 'application/json', body: d === undefined ? '' : JSON.stringify(d) });
      if (url.pathname === '/rest/v1/progress' && req.method() === 'GET') return json(200, db.progress ? [db.progress] : []);
      if (url.pathname === '/rest/v1/progress') { const body = JSON.parse(req.postData()); db.progress = { data: body.data, updated_at: body.updated_at }; return json(201); }
      return json(404, {});
    });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 250 })); });
    const tok = 'a.' + Buffer.from(JSON.stringify({ sub: 'u1', email: 'a@b.c' })).toString('base64url') + '.c';
    await p.goto(`http://localhost:3101/#access_token=${tok}&refresh_token=r1&expires_in=3600&token_type=bearer&type=magiclink`); await p.waitForTimeout(2000);
    const modal = await p.$('.modal');
    console.log('remote', remoteXp, 'url', p.url().split('#')[1], 'pushed', db.progress && JSON.parse(db.progress.data.profile).xp, 'conflictModal', !!modal, modal ? (await modal.innerText()).slice(0, 80).replace(/\n/g, ' ') : '', errs);
    await ctx.close();
  }
  await b.close();
})();
