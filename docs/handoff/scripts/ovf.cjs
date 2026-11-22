const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  p.on('dialog', (d) => d.accept());
  for (const step of ['full', 'listen']) {
    if (step === 'full') {
      await p.goto('http://localhost:3000/#/ielts-full');
      await p.waitForTimeout(400);
      await p.click('.full-start');
      await p.waitForTimeout(300);
      await p.click('.full-finish >> nth=0');
      await p.waitForTimeout(600);
    } else {
      await p.goto(process.argv[2] || 'http://localhost:3000/#/c/ielts/listening');
      await p.waitForTimeout(400);
      await p.click('.start-train');
      await p.waitForTimeout(2500);
    }
    const res = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return {
        w: document.documentElement.scrollWidth,
        culprits: [...document.querySelectorAll('body *')]
          .filter((el) => el.getBoundingClientRect().right > vw + 1)
          .slice(0, 6)
          .map((el) => `${el.tagName}.${el.className} in ${el.parentElement.className}/${el.parentElement.parentElement?.className} r=${Math.round(el.getBoundingClientRect().right)}`),
        deep: [...document.querySelectorAll('.q-area *')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => `${el.tagName}.${el.className} sw=${el.scrollWidth} cw=${el.clientWidth} ov=${getComputedStyle(el).overflowX}`).slice(0, 8),
        inq: [...document.querySelectorAll('.q-area *, .session-title *, .hud *')].filter((el) => el.getBoundingClientRect().right > vw - 4).slice(0, 8).map((el) => `${el.tagName}.${el.className} r=${Math.round(el.getBoundingClientRect().right)} w=${Math.round(el.getBoundingClientRect().width)}`),
        wide: [...document.querySelectorAll('body *')].filter((el) => el.scrollWidth > vw + 2 && getComputedStyle(el).overflowX === 'visible').slice(0, 5).map((el) => `${el.tagName}.${el.className} sw=${el.scrollWidth}`),
      };
    });
    console.log(step, JSON.stringify(res));
  }
  await b.close();
})();
