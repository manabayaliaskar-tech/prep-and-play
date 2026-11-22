const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
  await p.addInitScript(() => { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); const d = new Date(); const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; localStorage.setItem('prepplay:passSeen', JSON.stringify(id)); localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 3000, season: { id, pts: 4900, claimed: [] } })); });
  await p.goto('http://localhost:3101/#/season');
  await p.waitForTimeout(900);
  await p.click('.pass-buy-gold');
  await p.waitForTimeout(300);
  await p.click('.modal-actions .btn-primary');
  await p.waitForTimeout(900);
  console.log('gold', await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).season.gold));
  await p.click('.pass-claim-all');
  await p.waitForTimeout(1600);
  console.log('modal after claimAll', !!(await p.$('.modal')));
  for (let i = 0; i < 25 && (await p.$('.modal')); i++) {
    const btn = (await p.$('.lootbox3')) || (await p.$('.loot-close')) || (await p.$('.modal-actions .btn'));
    if (!btn) break;
    await btn.click();
    await p.waitForTimeout(1500);
  }
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')));
  console.log('claimed', st.season.claimed.length, 'gold claimed', (st.season.claimedGold || []).length, 'shards', st.shards, 'owned', (st.owned || []).length);
  await p.click('.pass-bonus').catch(() => console.log('no bonus btn'));
  await p.waitForTimeout(600);
  console.log('bonus claimed', await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:profile')).season.bonusClaimed));
  await p.goto('http://localhost:3101/#/');
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${__dirname}/pass-card.png`, clip: await p.$eval('.pass-card', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });
  console.log('errors', errs);
  await b.close();
})();
