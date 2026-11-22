const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag, lang] of [[1280, 900, 'd', 'es'], [390, 844, 'm', 'zh']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      for (const k of ['profile', 'cards']) localStorage.removeItem('prepplay:' + k);
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
    });
    await p.goto(`http://localhost:3000/#/c/${lang === 'es' ? 'spanish' : 'chinese'}`);
    await p.reload();
    await p.waitForTimeout(400);
    const entry = await p.$('.cards-entry');
    await p.click('.cards-entry');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/cards-setup-${tag}.png`, fullPage: true });
    await p.click('.start-btn');
    await p.waitForTimeout(400);
    let n = 0;
    for (let i = 0; i < 40; i++) {
      if (!(await p.$('.flashcard'))) break;
      await p.click('.flashcard');
      await p.waitForTimeout(600);
      if (i === 0) await p.screenshot({ path: `shots/cards-back-${tag}.png` });
      await p.click(i % 3 === 0 ? '.cards-no' : '.cards-yes');
      await p.waitForTimeout(350);
      n++;
    }
    await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/cards-res-${tag}.png`, fullPage: true });
    const st = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('prepplay:cards') || '{}')).length);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, lang, 'entry', Boolean(entry), 'cards shown', n, 'rated', st, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
