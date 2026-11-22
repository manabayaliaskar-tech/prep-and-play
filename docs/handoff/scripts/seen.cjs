const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const { buildTopicSet } = await import('/src/pools/stream.js');
    const { createRng, newSeed } = await import('/src/core/random.js');
    const { buildSet } = await import('/src/content/bank.js');
    const spec = [['e.modal', [3]], ['e.prep', [3]], ['e.det', [3]]]; // маленький банк: 4 + 4 + 3 = 11 заданий
    const runs = [];
    for (let i = 0; i < 3; i++) runs.push(buildTopicSet({ rng: createRng(newSeed()), spec, count: 5 }).map((q) => q.id));
    const all = runs.flat();
    const sat = [];
    for (let i = 0; i < 4; i++) sat.push(buildSet({ rng: createRng(newSeed()), section: 'rw', count: 10 }).map((q) => q.id));
    const satAll = sat.flat();
    const d1 = buildTopicSet({ rng: createRng(7), spec, count: 5, memory: false }).map((q) => q.id).join();
    const d2 = buildTopicSet({ rng: createRng(7), spec, count: 5, memory: false }).map((q) => q.id).join();
    await new Promise((r) => setTimeout(r, 600));
    return { first10unique: new Set(all.slice(0, 10)).size, total: all.length, unique: new Set(all).size, satUnique: new Set(satAll).size + '/' + satAll.length, duelSame: d1 === d2, stored: JSON.parse(localStorage.getItem('prepplay:seenQ') || '[]').length };
  });
  console.log(r, errs);
  await b.close();
})();
