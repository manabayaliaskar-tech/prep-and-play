// Сравнение обычной версии (3101) и собранной (3102): текст, число элементов, ошибки, эмодзи, ширина.
const { chromium } = require('playwright');
const S = __dirname + '/';
const routes = ['/', '/shop', '/achievements', '/season', '/profile', '/practice', '/exams', '/c/ent', '/quiz', '/today', '/explain', '/explain/motion', '/know/ent', '/saved', '/plan', '/c/math', '/code', '/c/olymp', '/premium', '/mock/ent', '/ielts-full', '/wardrobe', '/cards', '/diag/ent'];
async function snap(b, port, vp) {
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  const base = `http://localhost:${port}/`;
  await p.goto(base);
  await p.evaluate(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  const out = {};
  for (const r of routes) {
    await p.goto(base + '#' + r);
    await p.waitForTimeout(700);
    out[r] = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img.emo')];
      return {
        text: document.querySelector('#app')?.innerText.replace(/\d+/g, '#').slice(0, 4000),
        els: document.querySelectorAll('#app *').length,
        emo: imgs.length, alts: imgs.map((i) => `${i.parentElement.className}<${i.parentElement.parentElement?.className}>:${i.alt}`),
        badEmo: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
        w: document.documentElement.scrollWidth,
      };
    });
  }
  // Короткая тренировка: ответить на 3 вопроса.
  await p.goto(base + '#/practice');
  await p.waitForTimeout(600);
  const start = await p.$('.hub a[href*="#/play"], a[href*="#/play"]');
  let played = 'нет кнопки';
  if (start) {
    await start.click();
    await p.waitForTimeout(900);
    played = await p.evaluate(() => !!document.querySelector('.session, .q-area'));
  }
  if (vp.n === 'm') await p.screenshot({ path: S + `same-${port}.png` });
  await p.close();
  return { out, errs, played };
}
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 390, h: 844, n: 'm' }, { w: 1280, h: 860, n: 'd' }]) {
    const a = await snap(b, 3101, vp);
    const c = await snap(b, 3102, vp);
    let diffs = 0;
    for (const r of routes) {
      const x = a.out[r];
      const y = c.out[r];
      const issues = [];
      if (x.text !== y.text) { issues.push('текст'); const la = x.text.split('\n'); const lb = y.text.split('\n'); la.forEach((l, k) => { if (l !== lb[k]) console.log('   ', JSON.stringify(l), '|', JSON.stringify(lb[k])); }); }
      if (Math.abs(x.els - y.els) > 2) issues.push(`элементы ${x.els}→${y.els}`);
      if (x.emo !== y.emo) { issues.push(`эмодзи ${x.emo}→${y.emo}`); const ca = {}; x.alts.forEach((k) => (ca[k] = (ca[k] || 0) + 1)); y.alts.forEach((k) => (ca[k] = (ca[k] || 0) - 1)); if (r === '/shop' || r === '/') console.log(r, Object.entries(ca).filter(([, v]) => v)); }
      if (y.badEmo) issues.push(`битых эмодзи ${y.badEmo}`);
      if (y.w > vp.w) issues.push(`ширина ${y.w}`);
      if (issues.length) { diffs++; console.log(vp.n, r, issues.join(', ')); }
    }
    console.log(vp.n, 'маршрутов', routes.length, 'различий', diffs, '| тренировка', a.played, c.played, '| ошибки dev', a.errs, 'build', c.errs);
  }
  await b.close();
})();
