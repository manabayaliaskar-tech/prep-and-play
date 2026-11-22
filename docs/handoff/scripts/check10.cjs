const { chromium } = require('playwright');
const S = __dirname + '/';
const routes = ['/', '/shop', '/achievements', '/season', '/profile', '/practice', '/exams', '/c/ent', '/quiz', '/today', '/explain', '/explain/motion', '/know/ent', '/saved', '/plan', '/c/math', '/code', '/c/olymp', '/premium', '/mock/ent', '/ielts-full'];
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 1280, h: 860, n: 'd' }, { w: 390, h: 844, n: 'm' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 200)));
    const broken = new Set();
    p.on('response', (r) => { if (r.url().includes('/icons/emoji/') && r.status() >= 400) broken.add(r.url()); });
    await p.goto('http://localhost:3000/');
    await p.evaluate(() => localStorage.setItem('prepplay:lang', JSON.stringify('ru')));
    for (const r of routes) {
      await p.goto('http://localhost:3000/#' + r);
      await p.waitForTimeout(600);
      const res = await p.evaluate(() => {
        const RE = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)/gu;
        const left = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const n = walker.currentNode;
          const m = n.data.match(RE);
          if (m && !n.parentElement.closest('svg, script, style')) left.push(...m.filter((x) => x !== '🪙'));
        }
        const svgLeft = [...document.querySelectorAll('svg text')].filter((t) => /\p{Emoji_Presentation}/u.test(t.textContent)).map((t) => t.textContent);
        const imgs = [...document.querySelectorAll('img.emo')];
        const bad = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.alt);
        return { left: [...new Set(left)], svgLeft, imgs: imgs.length, bad, w: document.documentElement.scrollWidth };
      });
      if (res.left.length || res.svgLeft.length || res.bad.length || res.w > vp.w) console.log(vp.n, r, JSON.stringify(res));
    }
    await p.goto('http://localhost:3000/#/shop');
    await p.waitForTimeout(800);
    await p.screenshot({ path: S + `e-shop-${vp.n}.png` });
    await p.goto('http://localhost:3000/#/');
    await p.waitForTimeout(1200);
    await p.screenshot({ path: S + `e-hub-${vp.n}.png`, fullPage: false });
    console.log(vp.n, 'broken', [...broken], 'errors', errs);
    await p.close();
  }
  await b.close();
})();
