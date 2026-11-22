const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('dialog', (d) => d.accept());
  await p.goto('http://localhost:3000/#/');
  await p.evaluate(() => {
    localStorage.setItem('prepplay:chests', JSON.stringify([3, 7, 14, 30, 60, 100]));
    localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
  });
  // Все наряды на одной картинке
  const html = await p.evaluate(async () => {
    const out = [];
    for (const w of ['cap', 'scarf', 'glasses', 'headphones', 'crown', 'bow', 'astro']) {
      localStorage.setItem('prepplay:prepiWear', JSON.stringify(w));
      const { mascot } = await import('/src/ui/mascot.js');
      out.push(`<div style="display:inline-block;width:150px;text-align:center">${mascot(['happy', 'win', 'wow', 'think', 'sad', 'happy', 'win'][out.length])}<div>${w}</div></div>`);
    }
    return out.join('');
  });
  await p.evaluate((h) => {
    const d = document.createElement('div');
    d.id = 'wearshow';
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg,#fff);padding:30px;';
    d.innerHTML = h;
    document.body.append(d);
    d.querySelectorAll('svg').forEach((s) => (s.style.width = '140px'));
  }, html);
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/wears.png', clip: { x: 0, y: 0, width: 1140, height: 260 } });
  await p.evaluate(() => localStorage.setItem('prepplay:prepiWear', JSON.stringify('crown')));
  await p.goto('http://localhost:3000/#/profile');
  await p.reload();
  await p.waitForTimeout(500);
  const wardrobe = await p.$('.wardrobe');
  await wardrobe.screenshot({ path: 'shots/wardrobe.png' });
  await p.click('[data-wear="headphones"]');
  await p.waitForTimeout(300);
  const wear = await p.evaluate(() => localStorage.getItem('prepplay:prepiWear'));
  // Тренировка: Препи реагирует
  await p.goto('http://localhost:3000/#/c/geography/g2');
  await p.waitForTimeout(400);
  await p.click('.start-train');
  await p.waitForTimeout(400);
  for (let i = 0; i < 10; i++) {
    const ch = await p.$$('.choice');
    await ch[i % ch.length].click();
    await p.click('.btn-check');
    await p.waitForTimeout(250);
    if (i === 1) await p.screenshot({ path: 'shots/prepi-session.png' });
    await p.click('.btn-check');
    await p.waitForTimeout(300);
  }
  await p.waitForTimeout(150);
  await p.screenshot({ path: 'shots/results-anim-mid.png' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shots/results-anim-end.png' });
  console.log('wear', wear, errs);
  await b.close();
})();
