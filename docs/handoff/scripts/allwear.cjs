const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000/#/');
  await p.waitForTimeout(500);
  const n = await p.evaluate(async () => {
    const { mascot } = await import('/src/ui/mascot.js');
    const { ITEMS } = await import('/src/core/wardrobe.js');
    const base = { head: null, face: null, neck: null, back: null, color: 'classic', aura: null, pet: null };
    const list = ITEMS.filter((i) => i.unlock?.type === 'shop');
    document.body.innerHTML = `<div id="g" style="display:grid;grid-template-columns:repeat(12,1fr);gap:6px;padding:20px;background:#fff">${list
      .map((it) => `<div style="text-align:center;font:11px sans-serif">${mascot('happy', '', { ...base, [it.slot]: it.id })}<br>${it.id}</div>`)
      .join('')}</div><div style="display:flex;gap:20px;padding:20px">${mascot('sleep','', base)}${mascot('sad','',base)}</div>`;
    document.querySelectorAll('svg.mascot').forEach((s) => { s.style.width = '100px'; s.style.height = '108px'; });
    return list.length;
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/allwear.png', fullPage: true });
  console.log(n, errs);
  await b.close();
})();
