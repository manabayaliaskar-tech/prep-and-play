const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  await p.goto('http://localhost:8765/#path'); await p.waitForTimeout(300);
  const box = async (i) => (await p.locator('#view-path .cell').nth(i).boundingBox());
  await p.click('[data-tool="weight"]');
  const s1 = await box(41*5+20), s2 = await box(41*15+20);
  await p.mouse.move(s1.x+5,s1.y+5); await p.mouse.down(); await p.mouse.move(s2.x+5,s2.y+5,{steps:12}); await p.mouse.up();
  const grid = await p.evaluate(() => { const cells=[...document.querySelectorAll('#view-path .cell')]; return {rows:21, cols:41, start: cells.findIndex(c=>c.classList.contains('start')), end: cells.findIndex(c=>c.classList.contains('end')), walls: cells.map((c,i)=>c.classList.contains('wall')?i:-1).filter(i=>i>=0), weights: cells.map((c,i)=>c.classList.contains('weight')?i:-1).filter(i=>i>=0)}; });
  console.log(JSON.stringify(grid));
  await b.close();
})();
