const { chromium } = require('playwright');
(async () => {
  const theme = process.env.THEME || 'prep';
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/');
    await p.evaluate((th) => {
      localStorage.removeItem('prepplay:profile');
      localStorage.removeItem('prepplay:quizSeen');
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      localStorage.setItem('prepplay:theme', JSON.stringify(th));
    }, theme);
    await p.reload();
    await p.waitForTimeout(600);
    await (await p.$('.quiz-hero')).screenshot({ path: `shots/qhero-${tag}.png` });
    const overflow = async (label) => {
      const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 0) console.log('OVERFLOW', tag, label, o);
    };
    await overflow('home');
    // Режимы
    for (const mode of ['classic', 'blitz', 'survival', 'custom', 'daily']) {
      await p.goto(`http://localhost:3000/#/quiz/${mode}`);
      await p.waitForTimeout(400);
      await overflow(mode);
      if (mode === 'custom' || mode === 'classic') await p.screenshot({ path: `shots/qsetup-${mode}-${tag}.png`, fullPage: true });
    }
    // Классика: 10 вопросов
    const play = async (mode, max = 60) => {
      await p.goto(`http://localhost:3000/#/quiz/${mode}`);
      await p.waitForTimeout(300);
      await p.click('.start-btn');
      await p.waitForTimeout(400);
      let n = 0;
      for (let i = 0; i < max; i++) {
        if (await p.$('.results')) break;
        const ch = await p.$$('.choice');
        if (!ch.length) { await p.waitForTimeout(300); continue; }
        await ch[i % ch.length].click().catch(() => {});
        await p.click('.btn-check').catch(() => {});
        await p.waitForTimeout(mode === 'blitz' ? 1300 : 250);
        if (mode !== 'blitz') {
          await p.click('.btn-check').catch(() => {});
          await p.waitForTimeout(350);
        }
        n++;
      }
      await p.waitForTimeout(800);
      const res = Boolean(await p.$('.results'));
      const rows = await p.$$eval('.qb-row', (r) => r.length);
      console.log(tag, mode, 'answered', n, 'results', res, 'subjects', rows);
      if (mode === 'survival' || mode === 'classic') await p.screenshot({ path: `shots/qres-${mode}-${tag}.png`, fullPage: true });
      await overflow(mode + '-res');
    };
    await play('classic');
    if (tag === 'd') {
      await play('daily');
      await play('survival', 80);
      await play('blitz', 70);
      const ids = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:quizSeen') || '[]').length);
      const rec = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).records);
      console.log('seen', ids, 'records', JSON.stringify(rec));
      await p.goto('http://localhost:3000/#/');
      await p.waitForTimeout(500);
      await (await p.$('.quiz-hero')).screenshot({ path: `shots/qhero-after.png` });
    }
    if (errs.length) console.log('ERR', tag, errs.join(' | '));
    await p.close();
  }
  await b.close();
})();
