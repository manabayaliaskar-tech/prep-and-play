const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  await p.goto(process.argv[2] || 'http://localhost:3000/#/c/ent/mathlit');
  await p.waitForTimeout(400);
  await p.click('.start-train');
  await p.waitForTimeout(2000);
  const out = await p.evaluate(() => {
    const area = document.querySelector('.q-area');
    const r = (el) => {
      const x = el.getBoundingClientRect();
      return `${Math.round(x.left)}..${Math.round(x.right)}`;
    };
    const list = [area, ...area.querySelectorAll('*')].map((el) => {
      const cs = getComputedStyle(el);
      return `${el.tagName}.${String(el.className).slice(0, 30)} ${r(el)} sw=${el.scrollWidth} ow=${el.offsetWidth} ml=${cs.marginLeft} mr=${cs.marginRight} pos=${cs.position}`;
    });
    return { areaSW: area.scrollWidth, areaCW: area.clientWidth, list: list.slice(0, 12) };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
