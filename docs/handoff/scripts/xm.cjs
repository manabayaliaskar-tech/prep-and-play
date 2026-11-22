const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 820, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:lessonsSeen', JSON.stringify({})); });
    await p.goto('http://localhost:3101/#/c/ent'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${__dirname}/xm-${w}.png`, fullPage: w === 1280 });
    const info = [];
    if (w === 1280) {
      for (const r of ['path', 'survival', 'blitz', 'duel', 'daily']) {
        await p.goto('http://localhost:3101/#/x/ent/' + r); await p.waitForTimeout(700);
        if (r === 'path') await p.screenshot({ path: `${__dirname}/xm-path.png` });
        const btn = await p.$('.start-btn');
        if (btn) { await btn.click(); await p.waitForTimeout(700); info.push(r + ':' + !!(await p.$('.btn-check'))); }
      }
      await p.goto('http://localhost:3101/#/x/ent/lv/history/1'); await p.waitForTimeout(800);
      info.push('lv1:' + (!!(await p.$('.lesson-page')) ? 'lesson' : !!(await p.$('.btn-check')) ? 'session' : 'none'));
      await p.goto('http://localhost:3101/#/x/hsk/theory'); await p.waitForTimeout(700);
      info.push('theory:' + (await p.$$eval('.xm-theory', (l) => l.length)));
      await p.goto('http://localhost:3101/#/c/ielts'); await p.waitForTimeout(800);
      await p.screenshot({ path: `${__dirname}/xm-ielts.png` });
      await p.goto('http://localhost:3101/#/sat'); await p.waitForTimeout(800);
      info.push('satDaily:' + !!(await p.$('.daily-card')));
    }
    console.log(w, info.join(' '), await p.evaluate(() => document.documentElement.scrollWidth), errs);
    await p.close();
  }
  await b.close();
})();
