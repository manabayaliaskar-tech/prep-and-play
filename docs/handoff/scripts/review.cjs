const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:3000/#/');
    await p.evaluate(() => {
      for (const k of ['profile', 'mistakes', 'mistakesMastered', 'quizSeen']) localStorage.removeItem('prepplay:' + k);
      localStorage.setItem('prepplay:lang', JSON.stringify('ru'));
      localStorage.setItem('prepplay:theme', JSON.stringify('prep'));
    });
    // Тренировка: отвечаем неверно, где можем (выбираем не правильный вариант не знаем — жмём первый).
    const train = async (route) => {
      await p.goto('http://localhost:3000/#' + route);
      await p.waitForTimeout(400);
      await p.click('.start-train');
      await p.waitForTimeout(400);
      for (let i = 0; i < 12; i++) {
        if (await p.$('.results')) break;
        const input = await p.$('.spr-input:not([disabled])');
        if (input) await input.fill('99999');
        else await (await p.$$('.choice'))[3].click();
        await p.click('.btn-check');
        await p.waitForTimeout(200);
        await p.click('.btn-check');
        await p.waitForTimeout(300);
      }
    };
    await train('/c/math/g3');
    const count = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:mistakes') || '[]').length);
    await p.goto('http://localhost:3000/#/');
    await p.waitForTimeout(500);
    const card = await p.$('.review-card');
    if (card) await card.screenshot({ path: `shots/rv-card-${tag}.png` });
    // Страница курса — карточка слабых тем
    await p.goto('http://localhost:3000/#/c/math');
    await p.waitForTimeout(500);
    const weak = await p.$('.weak-card');
    if (weak) await weak.screenshot({ path: `shots/weak-card-${tag}.png` });
    // Повтор ошибок
    await p.goto('http://localhost:3000/#/mistakes');
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/rv-setup-${tag}.png`, fullPage: true });
    await p.click('.start-btn');
    await p.waitForTimeout(400);
    let n = 0;
    for (let i = 0; i < 12; i++) {
      if (await p.$('.results')) break;
      const input = await p.$('.spr-input:not([disabled])');
      if (input) await input.fill('1');
      else await (await p.$$('.choice'))[i % 4].click();
      await p.click('.btn-check');
      await p.waitForTimeout(200);
      await p.click('.btn-check');
      await p.waitForTimeout(300);
      n++;
    }
    await p.waitForTimeout(600);
    const after = await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:mistakes') || '[]').map((x) => x.stage + ':' + x.due).join(' '));
    // Слабые темы
    let weakOk = false;
    if (weak) {
      await p.goto('http://localhost:3000/#/weak/math');
      await p.waitForTimeout(400);
      weakOk = Boolean(await p.$('.choice, .spr-input'));
    }
    await p.goto('http://localhost:3000/#/profile');
    await p.waitForTimeout(400);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'mistakes', count, 'card', Boolean(card), 'weakCard', Boolean(weak), 'reviewed', n, 'after', after, 'weakSession', weakOk, 'overflow', o, errs);
    await p.close();
  }
  await b.close();
})();
