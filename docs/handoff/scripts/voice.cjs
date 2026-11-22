const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000/#/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); });
  await p.reload();
  let found = 0, after = 0;
  for (let i = 0; i < 6; i++) {
    await p.goto('http://localhost:3000/#/c/spanish/a1');
    await p.waitForTimeout(400);
    await p.click('.option-card');
    await p.waitForTimeout(400);
    for (let k = 0; k < 10; k++) {
      if (await p.$('.passage .say-btn')) { found++; if (found === 1) await p.screenshot({ path: 'shots/voice-q.png' }); }
      const opt = await p.$('.choice, .option, [data-choice]');
      if (!opt) break;
      await opt.click();
      await p.click('.btn-check');
      await p.waitForTimeout(250);
      if (await p.$('.sheet-say')) { after++; if (after === 1) await p.screenshot({ path: 'shots/voice-sheet.png' }); }
      await p.click('.btn-check');
      await p.waitForTimeout(250);
    }
    break;
  }
  await p.goto('http://localhost:3000/#/cards/fr');
  await p.waitForTimeout(400);
  const startBtn = await p.$('.cards-start, .btn-primary');
  if (startBtn) await startBtn.click();
  await p.waitForTimeout(400);
  const cardSay = await p.$('.flashcard .say-btn');
  if (cardSay) { await cardSay.click(); await p.waitForTimeout(200); }
  const flipped = await p.evaluate(() => document.querySelector('.flashcard')?.className);
  await p.screenshot({ path: 'shots/voice-card.png' });
  console.log({ found, after, cardSay: Boolean(cardSay), flipped }, errs);
  await b.close();
})();
