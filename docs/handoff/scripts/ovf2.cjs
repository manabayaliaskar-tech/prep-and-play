const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  await p.goto(process.argv[2] || 'http://localhost:3000/#/c/ent/mathlit');
  await p.waitForTimeout(400);
  await p.click('.start-train');
  await p.waitForTimeout(2000);
  const out = await p.evaluate(() => {
    const res = [];
    const root = document.querySelector('.q-area');
    const base = root.scrollWidth; const pre = root.firstElementChild.getAnimations().map((a) => [a.animationName, a.playState, a.currentTime]); const tl = document.timeline.currentTime;
    const walk = (el, depth) => {
      for (const ch of el.children) {
        const prev = ch.style.display;
        ch.style.display = 'none';
        const w = root.scrollWidth;
        ch.style.display = prev;
        if (w < base) {
          res.push(`${'  '.repeat(depth)}${ch.tagName}.${ch.className} -> ${w}`);
          if (depth < 6) walk(ch, depth + 1);
        }
      }
    };
    walk(root, 0);
    const card = root.firstElementChild;
    return { pre, tl, anims: card.getAnimations().map((a) => [a.animationName, a.playState, a.currentTime, a.effect.getTiming().duration, a.effect.getTiming().delay]), base, res, cardTransform: getComputedStyle(card).transform, cardAnim: getComputedStyle(card).animationName };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
