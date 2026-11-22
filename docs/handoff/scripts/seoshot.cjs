const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const base = 'file://' + __dirname + '/seo/';
  for (const [name, path, w] of [['ent-ru', 'exams/ent/index.html', 390], ['quad-kk', 'kk/lessons/quadratic-equations/index.html', 390], ['sat-en', 'en/exams/sat/index.html', 1200]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(base + path);
    await p.evaluate(() => document.querySelectorAll('details').forEach((d, i) => { if (i < 2) d.open = true; }));
    await p.screenshot({ path: `${__dirname}/seo-${name}.png`, fullPage: true });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(name, 'scrollWidth', sw);
  }
  await b.close();
})();
