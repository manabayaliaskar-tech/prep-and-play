const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      for (const k of ['profile', 'plan', 'planDay', 'mistakes']) localStorage.removeItem('prepplay:' + k);
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    });
    await p.reload();
    await p.waitForTimeout(400);
    const cta = await p.$('.plan-card.is-empty');
    await p.goto('http://localhost:3000/#/plan');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/plan-setup-${tag}.png`, fullPage: true });
    await p.click('[data-exam="ent"]');
    await p.click('.plan-save');
    await p.waitForTimeout(400);
    await p.click('.plan-go');
    await p.waitForTimeout(400);
    for (let i = 0; i < 12; i++) {
      if (await p.$('.results')) break;
      const input = await p.$('.spr-input:not([disabled])');
      if (input) await input.fill('1');
      else await (await p.$$('.choice'))[i % 4].click();
      await p.click('.btn-check');
      await p.waitForTimeout(200);
      await p.click('.btn-check');
      await p.waitForTimeout(300);
    }
    await p.waitForTimeout(500);
    await p.goto('http://localhost:3000/#/plan');
    await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/plan-${tag}.png`, fullPage: true });
    await p.goto('http://localhost:3000/#/');
    await p.waitForTimeout(500);
    const card = await p.$('.plan-card');
    await card.screenshot({ path: `shots/plan-card-${tag}.png` });
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const day = await p.evaluate(() => localStorage.getItem('prepplay:planDay'));
    console.log(tag, 'cta', Boolean(cta), 'planDay', day, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
