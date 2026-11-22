const { chromium } = require('playwright');
const NETS = {
  '4G': { latency: 70, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 },
  'медленный 3G': { latency: 300, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
};
(async () => {
  const b = await chromium.launch();
  for (const [net, cond] of Object.entries(NETS)) {
    for (const [name, url] of [['сейчас', 'http://localhost:3101/'], ['после сборки', 'http://localhost:3102/']]) {
      const times = [];
      let reqs = 0;
      let bytes = 0;
      for (let run = 0; run < 3; run++) {
        const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
        const p = await ctx.newPage();
        const cdp = await ctx.newCDPSession(p);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        await cdp.send('Network.emulateNetworkConditions', { offline: false, ...cond });
        let r = 0;
        let by = 0;
        cdp.on('Network.loadingFinished', (e) => {
          r += 1;
          by += e.encodedDataLength;
        });
        await p.addInitScript(() => localStorage.setItem('prepplay:tourDone', 'true'));
        const t0 = Date.now();
        await p.goto(url, { waitUntil: 'commit' });
        await p.waitForSelector('.hero-card', { timeout: 120000 });
        times.push(Date.now() - t0);
        await p.waitForTimeout(300);
        reqs = r;
        bytes = by;
        await ctx.close();
      }
      times.sort((a, x) => a - x);
      console.log(`${net} · ${name}: главная видна через ${(times[1] / 1000).toFixed(1)} с (медиана из 3), запросов ${reqs}, передано ${(bytes / 1024).toFixed(0)} КБ`);
    }
  }
  await b.close();
})();
