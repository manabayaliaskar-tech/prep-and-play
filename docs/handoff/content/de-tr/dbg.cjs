const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { localStorage.setItem('prepplay:tourDone','true'); localStorage.setItem('prepplay:welcomeDone','true'); localStorage.setItem('prepplay:lang','"ru"'); });
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', String(e)));
  await p.goto('http://localhost:3151/#/c/german/b1'); await p.waitForTimeout(1500);
  console.log(await p.$$eval('button, a', (xs) => xs.map((x) => x.className + ' :: ' + x.innerText.slice(0, 40).replace(/\s+/g, ' ')).filter((s) => /Трен|play|start/i.test(s))));
  await b.close();
})();
