const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:mockShort', 'true'); });
    await p.reload();
    await p.goto('http://localhost:3000/#/c/ent');
    await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/mock-course-${tag}.png` });
    await p.click('.mock-card');
    await p.waitForTimeout(400);
    await p.click('[data-track="math"]');
    await p.click('[data-track="physics"]');
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `shots/mock-setup-${tag}.png`, fullPage: true });
    await p.click('.mock-go');
    let sections = 0;
    for (let guard = 0; guard < 200; guard++) {
      await p.waitForTimeout(60);
      if (await p.$('.mock-score')) break;
      const next = await p.$('[data-res-action="0"]');
      if (next && (await p.$('.mock-next'))) {
        sections++;
        if (sections === 1) await p.waitForTimeout(1500);
        if (sections === 1) await p.screenshot({ path: `shots/mock-between-${tag}.png` });
        await next.click();
        continue;
      }
      const opt = await p.$('.choice');
      if (opt) { await opt.click(); await p.click('.btn-check'); continue; }
      const input = await p.$('.q-area input');
      if (input) { await input.fill('1'); await p.click('.btn-check'); }
    }
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/mock-result-${tag}.png`, fullPage: true });
    const mocks = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).mocks);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(tag, sections, JSON.stringify(mocks?.at(-1)).slice(0, 200), o, errs);
    await p.close();
  }
  await b.close();
})();
