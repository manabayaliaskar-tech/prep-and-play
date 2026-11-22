const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const tab of ['sorting','race','path','quiz']) {
    const m = await b.newPage({ viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true });
    m.on('pageerror', e => console.log('pageerror', e.message));
    await m.goto('http://localhost:8765/#'+tab); await m.waitForTimeout(400);
    const r = await m.evaluate(() => { const W = document.documentElement.clientWidth; const bad=[]; document.querySelectorAll('body *').forEach(e => { const rc=e.getBoundingClientRect(); if (rc.right > W+0.5 && !e.closest('.toolbar')) bad.push(e.tagName+'.'+e.className+' '+Math.round(rc.right)); }); return {sw: document.documentElement.scrollWidth, W, bad: bad.slice(0,6)}; });
    console.log(tab, JSON.stringify(r));
    if (tab==='race') await m.screenshot({path: process.argv[2]+'/m-race.png', fullPage:true});
  }
  await b.close();
})();
