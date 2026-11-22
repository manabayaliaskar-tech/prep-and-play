const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(400);
  for (const a of ['bubble','selection','insertion','merge','quick']) {
    await p.click(`[data-algo="${a}"]`);
    await p.click('#view-sorting [data-pb="end"]');
    console.log(a, (await p.textContent('[data-role="explain"]')).slice(0,60));
  }
  // custom input + error
  await p.fill('[data-role="custom"]', '5, x'); await p.click('.custom-input button');
  console.log('err:', await p.textContent('[data-role="error"]'));
  await p.fill('[data-role="custom"]', '9 3 7 1'); await p.click('.custom-input button');
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  console.log('kbd step:', await p.textContent('#view-sorting [data-pb="counter"]'));
  // predict playthrough to end
  await p.click('.switch'); await p.click('#view-sorting [data-pb="reset"]');
  await p.click('#view-sorting [data-pb="play"]');
  for (let i=0;i<40;i++){ await p.waitForTimeout(250); if (await p.isVisible('[data-answer="yes"]')) await p.click('[data-answer="no"]'); }
  console.log('score total:', await p.textContent('[data-role="score-total"]'), await p.textContent('#view-sorting [data-pb="counter"]'));
  // path: drag end node then run, then live update by drawing
  await p.goto('http://localhost:8765/#path'); await p.waitForTimeout(300);
  const box = async (i) => (await p.locator('#view-path .cell').nth(i).boundingBox());
  const endIdx = await p.evaluate(() => [...document.querySelectorAll('#view-path .cell')].findIndex(c => c.classList.contains('end')));
  const e = await box(endIdx), t = await box(endIdx + 41*5);
  await p.mouse.move(e.x+5,e.y+5); await p.mouse.down(); await p.mouse.move(t.x+5,t.y+5,{steps:8}); await p.mouse.up();
  console.log('end moved:', await p.evaluate(() => [...document.querySelectorAll('#view-path .cell')].findIndex(c => c.classList.contains('end'))), 'expected', endIdx+205);
  await p.keyboard.press('Space'); await p.waitForTimeout(300);
  await p.click('#view-path [data-pb="end"]');
  console.log('stats', await p.textContent('[data-role="stat-visited"]'), await p.textContent('[data-role="stat-cost"]'), await p.textContent('[data-role="stat-shortest"]'));
  // draw wall column live
  const s1 = await box(41*5+20), s2 = await box(41*15+20);
  await p.click('[data-tool="weight"]');
  await p.mouse.move(s1.x+5,s1.y+5); await p.mouse.down(); await p.mouse.move(s2.x+5,s2.y+5,{steps:12}); await p.mouse.up();
  console.log('live stats', await p.textContent('[data-role="stat-cost"]'), await p.textContent('[data-role="message"]'));
  await p.click('[data-algo="bfs"]');
  console.log('bfs live', await p.textContent('[data-role="stat-cost"]'), await p.textContent('[data-role="message"]'));
  await p.screenshot({path: process.argv[2]+'/path-live.png'});
  // quiz full
  await p.goto('http://localhost:8765/#quiz'); await p.waitForTimeout(200);
  await p.click('[data-action="start"]');
  for (let i=0;i<10;i++){ await p.click('[data-option="0"]'); await p.click('[data-role="next"] button'); }
  console.log('quiz:', (await p.textContent('.quiz h2')));
  console.log('errors', errs);
  await b.close();
})();
